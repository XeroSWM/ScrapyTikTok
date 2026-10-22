import os
import json
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
        
        # Cliente unificado del nuevo SDK google-genai
        self.client = genai.Client(api_key=api_key)
        # Modelo verificado en tu catálogo activo
        self.model_name = "gemini-2.5-flash"

    def generate_creator_report(self, profile: Dict[str, Any], psychometrics: Dict[str, Any], frequency: str) -> Dict[str, Any]:
        prompt = f"""
        Actúa como un director de marketing de influencers y psicólogo conductual.
        Analiza estos datos de TikTok y devuelve ÚNICAMENTE un JSON válido (sin markdown ni comillas invertidas):

        [CREADOR]
        - Usuario: {profile.get('username')} ({profile.get('name')})
        - Bio: {profile.get('bio')}
        - Seguidores: {profile.get('followers')}
        - Engagement: {profile.get('engagement')}
        - Frecuencia: {frequency}

        [PSICOMETRÍA BIG FIVE]
        - Arquetipo: {psychometrics.get('arquetipo')}
        - Rasgo Dominante: {psychometrics.get('dominant_trait')}
        - Puntajes: {json.dumps(psychometrics.get('ocean_scores', {}), ensure_ascii=False)}

        Estructura requerida:
        {{
            "diagnostico_perfil": "2 líneas explicando por qué su contenido funciona o su tono",
            "estrategia_monetizacion": "Cómo las marcas deberían colaborar según su rasgo dominante",
            "consejo_mejora": "1 recomendación concreta para optimizar su engagement"
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"[GEMINI API ERROR] {e}")
            return {
                "error": str(e),
                "diagnostico_perfil": f"Error al generar reporte: {str(e)[:80]}",
                "estrategia_monetizacion": "Consulte los registros de la terminal.",
                "consejo_mejora": "Reintentar la solicitud."
            }