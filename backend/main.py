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

@app.get("/api/info")
def get_system_info():
    return {
        "local_ip": get_local_ip(),
        "port": 8000
    }

@app.post("/api/scrape")
async def run_scrape_endpoint(payload: ScrapeRequest):
    service = TikTokScraperService()
    results = await service.scrape(payload.username, payload.target)
    return results

@app.websocket("/ws/scrape")
async def websocket_scrape_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        username = data.get("username", "")
        target = data.get("target", "all")

        async def send_log_to_client(message: str):
            await websocket.send_json({"type": "log", "message": message})

        service = TikTokScraperService(log_callback=send_log_to_client)
        final_data = await service.scrape(username, target)
        
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