from playwright.sync_api import sync_playwright
import time

def generar_sesion():
    with sync_playwright() as p:
        print("[1] Abriendo navegador...")
        browser = p.chromium.launch(headless=False, channel="msedge")
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print("[2] Navegando a TikTok...")
        page.goto("https://www.tiktok.com/login")

        print("-----------------------------------------------------")
        print("🛑 ACCIÓN REQUERIDA: Inicia sesión manualmente en la ventana.")
        print("Usa tu cuenta de Google y completa cualquier Captcha.")
        print("Tienes 3 minutos. El script guardará la sesión cuando termines.")
        print("-----------------------------------------------------")

        # Esperar hasta que el usuario inicie sesión y aparezca el botón de perfil o pasen 3 minutos
        try:
            page.wait_for_selector('[data-e2e="profile-icon"]', timeout=180000)
            print("[3] ¡Inicio de sesión detectado con éxito!")
        except:
            print("[WARN] Tiempo agotado o el selector del perfil no apareció. Guardando estado de todas formas...")

        # Guardar las cookies y el estado en un archivo JSON
        context.storage_state(path="auth.json")
        print("[4] Sesión guardada exitosamente en 'auth.json'.")
        
        browser.close()

if __name__ == "__main__":
    generar_sesion()