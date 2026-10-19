import asyncio
from services.tiktok_service import TikTokScraperService

async def scrape_tiktok_profile(username: str, target: str = "all", log_callback=None):
    service = TikTokScraperService(log_callback=log_callback)
    return await service.scrape(username, target)

if __name__ == "__main__":
    # Prueba manual directa por terminal
    async def print_log(msg):
        print(f"[CLI LOG] {msg}")

    test_user = "khaby.lame"
    print(f"Iniciando extracción de prueba para @{test_user}...")
    data = asyncio.run(scrape_tiktok_profile(test_user, "all", log_callback=print_log))
    print("\n--- Resultado Obtenido ---")
    print(data)