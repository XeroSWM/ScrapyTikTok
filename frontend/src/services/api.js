export const getBackendHost = () => {
  return window.location.hostname || "127.0.0.1";
};

export const fetchSystemInfo = async () => {
  try {
    const res = await fetch(`http://${getBackendHost()}:8000/api/info`);
    if (!res.ok) throw new Error("Error obteniendo info");
    return await res.json();
  } catch (error) {
    return { local_ip: getBackendHost(), port: 8000 };
  }
};

export const connectScraperSocket = ({ username, target, onLog, onResult, onError }) => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${getBackendHost()}:8000/ws/scrape`);

  socket.onopen = () => {
    socket.send(JSON.stringify({ username, target }));
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "log" && onLog) onLog(msg.message);
      if (msg.type === "result" && onResult) onResult(msg.data);
      if (msg.type === "error" && onError) onError(msg.message);
    } catch (e) {
      console.error("Error al procesar mensaje del socket:", e);
    }
  };

  socket.onerror = (err) => {
    if (onError) onError("Fallo de conexión WebSocket con el backend.");
  };

  return socket;
};