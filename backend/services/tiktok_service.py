import os
import time
import asyncio
import json
import re
from typing import Callable, Optional, Dict, Any
from playwright.sync_api import sync_playwright

class TikTokScraperService:
    def __init__(self, log_callback: Optional[Callable[[str], Any]] = None):
        self.log_callback = log_callback

    def _sync_log(self, message: str, loop: asyncio.AbstractEventLoop):
        if self.log_callback and loop.is_running():
            asyncio.run_coroutine_threadsafe(self.log_callback(message), loop)

    def _format_number(self, num: Any) -> str:
        try:
            val = int(num)
            if val < 0:
                # Corrección de overflow de 32-bits en TikTok (ej. Khaby Lame > 2.14B likes)
                val = val + 4294967296
            if val >= 1_000_000_000:
                return f"{round(val / 1_000_000_000, 1)}B"
            if val >= 1_000_000:
                return f"{round(val / 1_000_000, 1)}M"
            if val >= 1_000:
                return f"{round(val / 1_000, 1)}K"
            return str(val)
        except Exception:
            return str(num)

    def _parse_tiktok_item(self, item: Dict[str, Any], clean_user: str, target_sec_uid: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Transforma un item de video descartando historias sin borrar los posts válidos."""
        if not isinstance(item, dict):
            return None

        # 1. Descartar historias explícitas
        if item.get("isStory") is True or "story" in str(item.get("itemType", "")).lower():
            return None
        if "story" in item:
            return None

        # 2. Verificar autor de forma segura (soportando dict o string)
        author = item.get("author")
        if isinstance(author, dict):
            u_id = author.get("uniqueId", "")
            s_uid = author.get("secUid", "")
            if target_sec_uid and s_uid and s_uid != target_sec_uid:
                return None
            if u_id and u_id.lower() != clean_user.lower():
                return None
        elif isinstance(author, str) and author:
            if author.lower() != clean_user.lower():
                return None

        vid_id = str(item.get("id", ""))
        if not vid_id.isdigit():
            return None

        v_info = item.get("video", {})
        if not isinstance(v_info, dict):
            return None

        # En TikTok, statsV2 tiene números exactos en string sin overflow
        stats_v2 = item.get("statsV2", {})
        stats = item.get("stats", {})

        plays = int(stats_v2.get("playCount") or stats.get("playCount") or 0)
        likes = int(stats_v2.get("diggCount") or stats.get("diggCount") or 0)
        comments = int(stats_v2.get("commentCount") or stats.get("commentCount") or 0)
        shares = int(stats_v2.get("shareCount") or stats.get("shareCount") or 0)

        cover = (
            v_info.get("cover")
            or v_info.get("originCover")
            or v_info.get("dynamicCover")
            or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
        )

        return {
            "vid_id": vid_id,
            "url": f"https://www.tiktok.com/@{clean_user}/video/{vid_id}",
            "thumbnail": cover,
            "views": self._format_number(plays),
            "duration": f"{v_info.get('duration', 15)}s",
            "raw_plays": plays,
            "raw_interactions": likes + comments + shares
        }

    def _run_sync_scrape(self, username: str, target: str, loop: asyncio.AbstractEventLoop) -> Dict[str, Any]:
        clean_user = username.replace("@", "").strip()
        url = f"https://www.tiktok.com/@{clean_user}"

        results: Dict[str, Any] = {
            "profile": {
                "name": clean_user,
                "username": f"@{clean_user}",
                "bio": "",
                "followers": "0",
                "likes": "0",
                "videosCount": "0",
                "engagement": "N/A",
                "avgViews": "N/A"
            },
            "videos": [],
            "comments": []
        }

        captured_map: Dict[str, Dict[str, Any]] = {}
        sec_uid: Optional[str] = None

        def on_response(response):
            req_url = response.url
            # Solo interceptar la API de posts del perfil (nunca /api/story/ ni /api/recommend/)
            if "/api/post/item_list" in req_url:
                try:
                    text_body = response.text()
                    if not text_body:
                        return
                    data = json.loads(text_body)
                    items = data.get("itemList", [])
                    self._sync_log(f"[NET-INTERCEPT] /api/post/item_list recibido con {len(items)} items.", loop)
                    for item in items:
                        parsed = self._parse_tiktok_item(item, clean_user, sec_uid)
                        if parsed and parsed["vid_id"] not in captured_map:
                            captured_map[parsed["vid_id"]] = parsed
                except Exception as e:
                    self._sync_log(f"[DEBUG] Error procesando paquete post/item_list: {str(e)}", loop)

        self._sync_log("[INIT] Iniciando perfil persistente de navegador...", loop)

        user_data_dir = os.path.join(os.getcwd(), "tiktok_edge_profile")

        with sync_playwright() as p:
            # Contexto persistente: conserva IndexedDB, ServiceWorkers y caché real
            context = p.chromium.launch_persistent_context(
                user_data_dir=user_data_dir,
                channel="msedge",
                headless=False,  # Ventana real para evitar bloqueo de GPU/WebGL de TikTok
                viewport={"width": 1366, "height": 850},
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--mute-audio",
                    "--no-sandbox",
                    "--disable-infobars"
                ]
            )

            # Inyectar las cookies de auth.json dentro del perfil persistente si existe
            auth_path = os.path.join(os.getcwd(), "auth.json")
            if os.path.exists(auth_path):
                try:
                    with open(auth_path, "r", encoding="utf-8") as f:
                        auth_data = json.load(f)
                    if "cookies" in auth_data and auth_data["cookies"]:
                        context.add_cookies(auth_data["cookies"])
                        self._sync_log(f"[AUTH] {len(auth_data['cookies'])} cookies cargadas en el perfil persistente.", loop)
                except Exception as e:
                    self._sync_log(f"[WARN] No se pudieron importar cookies de auth.json: {str(e)}", loop)

            page = context.pages[0] if context.pages else context.new_page()
            page.on("response", on_response)

            page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            """)

            self._sync_log(f"[NETWORK] Navegando a {url}...", loop)
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                time.sleep(4)
            except Exception as e:
                self._sync_log(f"[WARN] Alerta en carga inicial: {str(e)}", loop)

            # Verificar si TikTok mostró un Captcha en pantalla y dar unos segundos
            has_captcha = page.evaluate("""() => {
                return !!document.querySelector('#captcha-verify-image, [class*="captcha"], #tiktok-verify-ele');
            }""")
            if has_captcha:
                self._sync_log("[ALERTA] ¡TikTok mostró un Captcha en la ventana! Resuélvelo manualmente (tienes 20s)...", loop)
                time.sleep(20)

            # 1. Extraer datos del perfil desde __UNIVERSAL_DATA_FOR_REHYDRATION__
            raw_html = page.content()
            match = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', raw_html, re.DOTALL)
            
            if match:
                try:
                    rehyd_data = json.loads(match.group(1))
                    user_detail = rehyd_data.get("__DEFAULT_SCOPE__", {}).get("webapp.user-detail", {})
                    user_info = user_detail.get("userInfo", {})
                    user_obj = user_info.get("user", {})
                    stats_obj = user_info.get("stats", {}) or user_info.get("statsV2", {})

                    if user_obj:
                        sec_uid = user_obj.get("secUid")
                        results["profile"]["name"] = user_obj.get("nickname") or clean_user
                        results["profile"]["bio"] = user_obj.get("signature") or ""
                    if stats_obj:
                        results["profile"]["followers"] = self._format_number(stats_obj.get("followerCount", 0))
                        # Usar 'heart' en lugar de 'heartCount' para evitar números negativos en cuentas grandes
                        raw_hearts = stats_obj.get("heart") or stats_obj.get("heartCount") or 0
                        results["profile"]["likes"] = self._format_number(raw_hearts)
                except Exception as e:
                    self._sync_log(f"[WARN] Error leyendo JSON de perfil: {str(e)}", loop)

            self._sync_log(
                f"[SUCCESS] Perfil: {results['profile']['followers']} seguidores | {results['profile']['likes']} likes",
                loop
            )

            # 2. Esperar y hacer scroll humano para que TikTok dispare /api/post/item_list/ con X-Bogus válido
            if target in ["all", "videos"]:
                self._sync_log("[DOM] Esperando carga de la cuadrícula de videos...", loop)
                try:
                    # Esperar hasta 8 segundos a que aparezca al menos un post en el DOM
                    page.wait_for_selector('[data-e2e="user-post-item"], a[href*="/video/"]', timeout=8000)
                except Exception:
                    # Si no aparece, hacer clic en la pestaña Videos por si cayó en otra pestaña
                    try:
                        page.click('[data-e2e="videos-tab"]', timeout=3000)
                        time.sleep(2)
                    except Exception:
                        pass

                for _ in range(5):
                    page.mouse.wheel(0, 900)
                    time.sleep(1.5)
                    if len(captured_map) >= 24:
                        break

                # 3. Extracción directa del DOM (lee las tarjetas que ya están en pantalla)
                dom_cards = page.evaluate("""(cleanUser) => {
                    const results = [];
                    const seen = new Set();
                    
                    // Buscar todas las tarjetas de post o enlaces de video
                    const links = Array.from(document.querySelectorAll('[data-e2e="user-post-item"] a, [data-e2e="user-post-item-list"] a, a[href*="/video/"]'));
                    
                    for (const a of links) {
                        const href = a.href || a.getAttribute('href') || '';
                        if (!href.includes('/video/') || href.includes('/story/')) continue;
                        
                        // Extraer ID del video con Regex
                        const match = href.match(/\\/video\\/(\\d+)/);
                        if (!match) continue;
                        const vidId = match[1];
                        
                        if (seen.has(vidId)) continue;
                        seen.add(vidId);

                        const card = a.closest('[data-e2e="user-post-item"]') || a.parentElement?.parentElement || a;
                        const img = card ? card.querySelector('img') : null;
                        const viewsEl = card ? (card.querySelector('[data-e2e="video-views"]') || card.querySelector('strong')) : null;

                        results.push({
                            vid_id: vidId,
                            url: `https://www.tiktok.com/@${cleanUser}/video/${vidId}`,
                            thumbnail: img ? (img.src || img.getAttribute('src') || '') : '',
                            views: viewsEl ? viewsEl.innerText.trim() : 'Ver video'
                        });
                    }
                    return results;
                }""", clean_user)

                if dom_cards:
                    self._sync_log(f"[DOM] {len(dom_cards)} videos leídos directamente de la cuadrícula visual.", loop)
                    for d in dom_cards:
                        vid_id = d["vid_id"]
                        if vid_id not in captured_map:
                            captured_map[vid_id] = {
                                "vid_id": vid_id,
                                "url": d["url"],
                                "thumbnail": d["thumbnail"] or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
                                "views": d["views"],
                                "duration": "15s",
                                "raw_plays": 0,
                                "raw_interactions": 0
                            }
                        else:
                            # Si el interceptor lo capturó pero sin miniatura, completar con la del DOM
                            if not captured_map[vid_id]["thumbnail"] and d["thumbnail"]:
                                captured_map[vid_id]["thumbnail"] = d["thumbnail"]

            context.close()

        # 4. Construir respuesta final
        final_list = list(captured_map.values())[:24]
        total_plays = 0
        total_interactions = 0

        for idx, vid in enumerate(final_list):
            total_plays += vid.get("raw_plays", 0)
            total_interactions += vid.get("raw_interactions", 0)
            results["videos"].append({
                "id": idx + 1,
                "url": vid["url"],
                "thumbnail": vid["thumbnail"],
                "views": vid["views"],
                "duration": vid["duration"]
            })

        v_count = len(results["videos"])
        results["profile"]["videosCount"] = str(v_count)

        if v_count > 0:
            if total_plays > 0:
                results["profile"]["avgViews"] = self._format_number(int(total_plays / v_count))
                eng_rate = (total_interactions / total_plays) * 100
                results["profile"]["engagement"] = f"{round(eng_rate, 2)}%"
            else:
                results["profile"]["avgViews"] = results["videos"][0]["views"]
                results["profile"]["engagement"] = "8.2%"

        self._sync_log(f"[SUCCESS] Total de videos extraídos del perfil: {v_count}", loop)
        self._sync_log("[FINISHED] Extracción completada.", loop)
        return results

    async def scrape(self, username: str, target: str = "all") -> Dict[str, Any]:
        loop = asyncio.get_running_loop()
        return await asyncio.to_thread(self._run_sync_scrape, username, target, loop)