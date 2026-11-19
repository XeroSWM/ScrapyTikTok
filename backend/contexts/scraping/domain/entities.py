from dataclasses import dataclass

@dataclass(frozen=True)
class ExtractionLimits:
    max_videos: int = 19
    max_comment_videos: int = 2
    max_following: int = 20
    max_followers: int = 20

@dataclass
class TargetProfile:
    username: str
    limits: ExtractionLimits

