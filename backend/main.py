from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.network import get_local_ip
from services.tiktok_service import TikTokScraperService

app = FastAPI(title="TikTok Scraper Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    username: str
    target: str = "all"
    max_videos: int = 19
    max_comment_videos: int = 2
    max_following: int = 20
    max_followers: int = 20

@app.get("/api/info")
def get_system_info():
    return {
        "local_ip": get_local_ip(),
        "port": 8000
    }

@app.post("/api/scrape")
async def run_scrape_endpoint(payload: ScrapeRequest):
    service = TikTokScraperService()
    results = await service.scrape(
        username=payload.username,
        target=payload.target,
        max_videos=payload.max_videos,
        max_comment_videos=payload.max_comment_videos,
        max_following=payload.max_following,
        max_followers=payload.max_followers
    )
    return results

@app.websocket("/ws/scrape")
async def websocket_scrape_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        username = data.get("username", "")
        target = data.get("target", "all")
        
        # Extracción de los límites configurables con fallbacks
        max_videos = int(data.get("max_videos", 19))
        max_comment_videos = int(data.get("max_comment_videos", 2))
        max_following = int(data.get("max_following", 20))
        max_followers = int(data.get("max_followers", 20))

        async def send_log_to_client(message: str):
            await websocket.send_json({"type": "log", "message": message})

        service = TikTokScraperService(log_callback=send_log_to_client)
        final_data = await service.scrape(
            username=username,
            target=target,
            max_videos=max_videos,
            max_comment_videos=max_comment_videos,
            max_following=max_following,
            max_followers=max_followers
        )
        
        await websocket.send_json({"type": "result", "data": final_data})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
    finally:
        try:
            await websocket.close()
        except Exception:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)