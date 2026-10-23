import os
import json
import time
from pathlib import Path
from typing import Dict, Any
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Localizar la ruta del archivo .env dentro de backend/
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

class GeminiAuditService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(f"Falta GOOGLE_API_KEY en {env_path}")
        
        self.client = genai.Client(api_key=api_key)
        
        # Lista priorizada de modelos disponibles en tu proyecto
        # Si el primero está saturado (503), salta automáticamente al siguiente
        self.candidate_models = [
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-flash-latest"
        ]

    def generate_creator_report(self, profile: Dict[str, Any], psychometrics: Dict[str, Any], frequency: str) -> Dict[str, Any]:
        ocean_scores = psychometrics.get("ocean_scores", {})
        marcas = psychometrics.get("marcas_recomendadas", [])
        
        prompt = f"""
        Eres un consultor senior en Psicometría del Consumidor y Estrategia de Influencer Marketing.
        Audita el siguiente perfil de TikTok a partir de sus métricas de interacción, su distribución de personalidad Big Five (OCEAN normalizada al 100%) y su afinidad sectorial calculada por embeddings.

        [MÉTRICAS DEL PERFIL]
        - Usuario: {profile.get('username')} ({profile.get('name')})
        - Biografía: {profile.get('bio')}
        - Seguidores: {profile.get('followers')}
        - Tasa de Engagement: {profile.get('engagement')}
        - Frecuencia de Publicación: {frequency}

        [PERFIL CONDUCTUAL BIG FIVE (OCEAN)]
        - Arquetipo: {psychometrics.get('arquetipo')}
        - Rasgo Dominante: {psychometrics.get('dominant_trait')}
        - Distribución Relativa: {json.dumps(ocean_scores, ensure_ascii=False)}

        [COMPATIBILIDAD COMERCIAL DETECTADA POR EMBEDDINGS]
        - Nichos con mayor afinidad: {json.dumps(marcas, ensure_ascii=False)}

        INSTRUCCIONES DE AUDITORÍA:
        1. Diagnóstico del Perfil: Sintetiza cómo su rasgo dominante y su tasa de engagement explican la percepción psicológica de su contenido y el nivel de lealtad de su comunidad.
        2. Estrategia de Monetización: Recomienda cómo monetizar su perfil o cómo las marcas deben negociar con él, considerando las industrias calculadas en el Fit Comercial.
        3. Recomendación de Crecimiento: Formula una acción táctica precisa para corregir deficiencias de frecuencia, retención o interacción.

        Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
        {{
            "diagnostico_perfil": "Texto estructurado del diagnóstico (máx 3 frases densas y profesionales).",
            "estrategia_monetizacion": "Estrategia concreta basada en su arquetipo y marcas afines.",
            "consejo_mejora": "Acción táctica accionable a corto plazo."
        }}
        """

        last_error = None

        # Recorre la lista de modelos candidatos si alguno devuelve 503 o falla por demanda
        for model in self.candidate_models:
            for attempt in range(2):  # Hasta 2 intentos por modelo con pequeña pausa
                try:
                    response = self.client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.3
                        )
                    )
                    return json.loads(response.text)

                except Exception as e:
                    last_error = e
                    err_msg = str(e)
                    print(f"[WARN] Fallo con modelo {model} (intento {attempt+1}): {err_msg}")
                    
                    # Si el error es saturación temporal (503 / UNAVAILABLE), espera brevemente y reintenta
                    if "503" in err_msg or "UNAVAILABLE" in err_msg or "high demand" in err_msg:
                        time.sleep(1.5)
                        continue
                    else:
                        # Si es otro tipo de error no recuperable en este modelo, pasa al siguiente
                        break

        # Si todos los modelos candidatos fallan
        print(f"[GEMINI API CRITICAL ERROR] Todos los modelos saturados: {last_error}")
        return {
            "error": str(last_error),
            "diagnostico_perfil": "Los servidores de Google reportan alta demanda momentánea. Por favor, reintenta en unos segundos.",
            "estrategia_monetizacion": "Intenta regenerar la auditoría con el botón superior.",
            "consejo_mejora": "Reintentar la petición."
        }