import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, Any, List

class BigFiveEmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # 1. Anclajes Big Five
        self.traits_anchors = {
            "Apertura": {
                "high": "creatividad, curiosidad intelectual, arte, ideas abstractas, innovación, exploración, mente abierta, imaginación",
                "low": "rutina, convencionalismo, pragmatismo rígido, resistencia al cambio, tradición estricta"
            },
            "Responsabilidad": {
                "high": "disciplina, organización, metas claras, productividad, constancia, profesionalismo, orden, detalle",
                "low": "desorganización, espontaneidad sin control, procrastinación, descuido, impulsividad"
            },
            "Extraversión": {
                "high": "sociabilidad, energía alta, entusiasmo, interacción social constante, liderazgo, expresión abierta, fiesta",
                "low": "timidez, introspección, soledad, tranquilidad, bajo perfil, calma, reflexión personal"
            },
            "Amabilidad": {
                "high": "empatía, generosidad, confianza, amabilidad, cooperación, apoyo a la comunidad, tolerancia",
                "low": "competitividad hostil, crítica severa, cinismo, desconfianza, agresividad, confrontación"
            },
            "Estabilidad Emocional": {
                "high": "calma bajo presión, resiliencia, seguridad en sí mismo, equilibrio emocional, serenidad",
                "low": "ansiedad, drama, quejas frecuentes, volatilidad emocional, estrés extremo, inseguridad"
            }
        }
        
        self.trait_vectors = {}
        for trait, anchors in self.traits_anchors.items():
            vec_high = self.model.encode(anchors["high"])
            vec_low = self.model.encode(anchors["low"])
            self.trait_vectors[trait] = {"high": vec_high, "low": vec_low}

        # 2. Catálogo de Nichos y Marcas Comerciales para clasificación dinámica
        self.brand_niches = {
            "Tecnología y Software": "programación, software, aplicaciones, código, inteligencia artificial, computadoras, gadgets, hardware",
            "Gaming y Esports": "videojuegos, gameplay, consolas, stream, pc gamer, torneos, discord",
            "Fitness y Vida Saludable": "entrenamiento, gimnasio, nutrición, ejercicio, salud, deportes, suplementos, pérdida de peso",
            "Finanzas y Cripto": "inversiones, dinero, negocios, economía, finanzas personales, criptomonedas, trading, ahorro",
            "Moda y Cuidado Personal": "ropa, estilo, outfits, skincare, belleza, maquillaje, estética, tendencias",
            "Humor y Comedia": "bromas, comedia, risa, sketches, entretenimiento, memes, parodias, diversión",
            "Gastronomía y Cocina": "recetas, comida, restaurantes, cocina, platillos, chef, postres, degustación",
            "Educación y Ciencia": "aprender, historia, ciencia, tutoriales, datos curiosos, libros, divulgación, universidad",
            "Viajes y Turismo": "viajes, mochilero, hoteles, destinos turísticos, aventuras, vuelos, paisajes",
            "Música y Producción": "canciones, ritmo, instrumentos, producción musical, conciertos, cantantes, audio"
        }

        # Precomputar vectores de las industrias
        self.niche_vectors = {niche: self.model.encode(desc) for niche, desc in self.brand_niches.items()}

    def _compute_recommended_brands(self, creator_vector: np.ndarray) -> List[Dict[str, Any]]:
        """Calcula la afinidad semántica real entre el creador y cada industria."""
        affinities = []
        for niche, n_vec in self.niche_vectors.items():
            sim = float(cosine_similarity(creator_vector, n_vec.reshape(1, -1))[0][0])
            affinities.append({"niche": niche, "similarity": round(sim * 100, 1)})
        
        # Ordena de mayor a menor coincidencia y devuelve el Top 4 dinámico
        affinities.sort(key=lambda x: x["similarity"], reverse=True)
        return affinities[:4]

    def analyze(self, profile: Dict[str, Any], videos: List[Dict[str, Any]], comments: List[Dict[str, Any]]) -> Dict[str, Any]:
        creator_corpus = [profile.get("bio", "")]
        creator_corpus.extend([v.get("desc", "") for v in videos if v.get("desc")])
        creator_text = " ".join([t for t in creator_corpus if t.strip()])

        audience_corpus = [c.get("text", "") for c in comments if c.get("text")]

        if not creator_text.strip():
            creator_text = profile.get("name", "") or "perfil sin descripcion"

        creator_vector = self.model.encode(creator_text).reshape(1, -1)
        
        # 1. Ponderación vectorial de cada rasgo
        raw_weights = {}
        for trait, vecs in self.trait_vectors.items():
            sim_high = float(cosine_similarity(creator_vector, vecs["high"].reshape(1, -1))[0][0])
            sim_low = float(cosine_similarity(creator_vector, vecs["low"].reshape(1, -1))[0][0])
            
            # Margen positivo de base para evitar ponderaciones negativas o nulas
            diff = sim_high - sim_low
            weight = max(0.05, 0.5 + diff)
            raw_weights[trait] = weight

        # 2. Normalización proporcional para sumar exactamente 100%
        total_weight = sum(raw_weights.values())
        scores = {}
        cumulative = 0
        traits_list = list(raw_weights.keys())

        for idx, trait in enumerate(traits_list):
            if idx == len(traits_list) - 1:
                # El último rasgo absorbe el remanente por redondeo
                scores[trait] = max(1, 100 - cumulative)
            else:
                pct = int(round((raw_weights[trait] / total_weight) * 100))
                scores[trait] = pct
                cumulative += pct

        dominant_trait = max(scores, key=scores.get)

        # Cálculo dinámico de marcas e industrias afines
        recommended_niches = self._compute_recommended_brands(creator_vector)

        return {
            "ocean_scores": scores,
            "dominant_trait": dominant_trait,
            "arquetipo": self._get_archetype(dominant_trait),
            "marcas_recomendadas": recommended_niches,
            "resumen_audiencia": {
                "comentarios_evaluados": len(audience_corpus),
                "tono_comunidad": "Colaborativo y Cercano" if scores["Amabilidad"] >= 20 else "Crítico y Exigente"
            }
        }

    def _get_archetype(self, dominant: str) -> str:
        mapping = {
            "Apertura": "El Visionario Creativo (Innovación y Nuevas Ideas)",
            "Extraversión": "El Conector Social (Dinamismo y Entretenimiento)",
            "Responsabilidad": "El Experto Estructurado (Educación y Métodos)",
            "Amabilidad": "El Constructor de Comunidad (Empatía y Cercanía)",
            "Estabilidad Emocional": "El Analista Resiliente (Pragmatismo y Control)"
        }
        return mapping.get(dominant, "Creador Multidisciplinario")