import socket

def get_local_ip() -> str:
    """Obtiene la dirección IP local de la tarjeta de red activa."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # No realiza una conexión real hacia afuera, solo consulta la interfaz de salida
        s.connect(("10.254.254.254", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip