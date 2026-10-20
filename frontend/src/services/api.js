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

export const connectScraperSocket = ({
  username,
  target,
  max_videos = 19,
  max_comment_videos = 2,
  max_following = 20,
  max_followers = 20,
  onLog,
  onResult,
  onError
}) => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${getBackendHost()}:8000/ws/scrape`);

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        username,
        target,
        max_videos: Number(max_videos),
        max_comment_videos: Number(max_comment_videos),
        max_following: Number(max_following),
        max_followers: Number(max_followers)
      })
    );
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