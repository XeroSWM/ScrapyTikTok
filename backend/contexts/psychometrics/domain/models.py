from dataclasses import dataclass
from typing import Dict, List

@dataclass
class OceanProfile:
    ocean_scores: Dict[str, float]
    dominant_trait: str
    archetype: str
    recommended_brands: List[dict]

