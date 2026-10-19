import asyncio
from typing import Callable, Optional, Dict, Any
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

class TikTokScraperService:
    def __init__(self, log_callback: Optional[Callable[[str], Any]] = None):
        self.log_callback = log_callback

    async def log(self, message: str):
        if self.log_callback:
            await self.log_callback(message)

    async def scrape(self, username: str, target: str = "all") -> Dict[str, Any]:
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

        async with async_playwright() as p:
            await self.log("[INIT] Iniciando Chromium con bypass de automatización...")
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-infobars"
                ]
            )

            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                locale="es-ES",
                viewport={"width": 1280, "height": 800}
            )

            page = await context.new_page()
            await stealth_async(page)

            await self.log(f"[NETWORK] Navegando al perfil: {url}")
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=40000)
                await asyncio.sleep(2.5)
            except Exception as e:
                await self.log(f"[ERROR] Tiempo de espera agotado al conectar: {str(e)}")
                await browser.close()
                return results

            # 1. Extracción de estadísticas del perfil
            await self.log("[DOM] Extrayendo datos biográficos y métricas...")
            try:
                name_elem = await page.query_selector('h1[data-e2e="user-title"]') or await page.query_selector('h2[data-e2e="user-subtitle"]')
                bio_elem = await page.query_selector('[data-e2e="user-bio"]')
                followers_elem = await page.query_selector('[data-e2e="followers-count"]')
                likes_elem = await page.query_selector('[data-e2e="likes-count"]')

                if name_elem:
                    results["profile"]["name"] = (await name_elem.inner_text()).strip()
                if bio_elem:
                    results["profile"]["bio"] = (await bio_elem.inner_text()).strip()
                if followers_elem:
                    results["profile"]["followers"] = (await followers_elem.inner_text()).strip()
                if likes_elem:
                    results["profile"]["likes"] = (await likes_elem.inner_text()).strip()

                await self.log(f"[SUCCESS] Perfil: {results['profile']['followers']} seguidores | {results['profile']['likes']} likes")
            except Exception as e:
                await self.log(f"[WARN] Error extrayendo métricas de perfil: {str(e)}")

            # 2. Extracción de Videos
            if target in ["all", "videos"]:
                await self.log("[DOM] Realizando scroll en feed para renderizar videos...")
                await page.mouse.wheel(0, 1800)
                await asyncio.sleep(2)

                video_elements = await page.query_selector_all('[data-e2e="user-post-item"]')
                await self.log(f"[DOM] Nodos de video detectados: {len(video_elements)}")

                for idx, v_elem in enumerate(video_elements[:8]):
                    try:
                        link_el = await v_elem.query_selector("a")
                        img_el = await v_elem.query_selector("img")
                        views_el = await v_elem.query_selector('[data-e2e="video-views"]')

                        v_url = await link_el.get_attribute("href") if link_el else ""
                        v_img = await img_el.get_attribute("src") if img_el else ""
                        v_views = (await views_el.inner_text()).strip() if views_el else "N/A"

                        results["videos"].append({
                            "id": idx + 1,
                            "url": v_url,
                            "thumbnail": v_img or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
                            "views": v_views,
                            "duration": "0:25"
                        })
                    except Exception:
                        continue

                results["profile"]["videosCount"] = str(len(results["videos"]))
                await self.log(f"[SUCCESS] {len(results['videos'])} videos extraídos con éxito.")

            # 3. Extracción de comentarios del primer video disponible
            if target in ["all", "comments"] and results["videos"]:
                first_video_url = results["videos"][0]["url"]
                if first_video_url:
                    await self.log(f"[DOM] Abriendo primer video para comentarios: {first_video_url}")
                    try:
                        await page.goto(first_video_url, wait_until="domcontentloaded", timeout=30000)
                        await asyncio.sleep(2.5)
                        
                        await page.mouse.wheel(0, 800)
                        await asyncio.sleep(1.5)

                        comment_items = await page.query_selector_all('[data-e2e="comment-level-1"]')
                        await self.log(f"[DOM] Comentarios detectados: {len(comment_items)}")

                        for idx, c_item in enumerate(comment_items[:8]):
                            text_el = await c_item.query_selector('[data-e2e="comment-text"]')
                            user_el = await c_item.query_selector('[data-e2e="comment-username-1"]')
                            
                            c_text = (await text_el.inner_text()).strip() if text_el else ""
                            c_user = (await user_el.inner_text()).strip() if user_el else f"user_{idx + 1}"
                            
                            if c_text:
                                results["comments"].append({
                                    "id": idx + 1,
                                    "user": c_user,
                                    "text": c_text
                                })
                        await self.log(f"[SUCCESS] {len(results['comments'])} comentarios capturados.")
                    except Exception as err:
                        await self.log(f"[WARN] No se pudo leer comentarios del video: {str(err)}")

            await self.log("[FINISHED] Extracción completada.")
            await browser.close()
            return results