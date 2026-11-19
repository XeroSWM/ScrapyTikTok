export const getBackendHost = () => {
  return window.location.hostname || "127.0.0.1";
};

export const getBackendUrl = () => {
  const configuredUrl = import.meta.env?.VITE_API_URL?.trim();
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const url = new URL(configuredUrl || protocol + "//" + getBackendHost() + ":8000");
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("La dirección del backend debe utilizar HTTP o HTTPS.");
  }
  return url.origin;
};

export const fetchSystemInfo = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(getBackendUrl() + "/api/info", {
      signal: controller.signal
    });
    if (!response.ok) throw new Error("Error HTTP " + response.status);
    const info = await response.json();
    if (typeof info?.local_ip !== "string" || typeof info?.port !== "number") {
      throw new Error("Respuesta del servidor no válida.");
    }
    return info;
  } finally {
    clearTimeout(timeout);
  }
};

export const generateGeminiReport = async (payload) => {
  const response = await fetch(getBackendUrl() + "/api/ai/gemini-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error("Error HTTP " + response.status + " al consultar Gemini");
  }
  const result = await response.json();
  if (!result || result.error || typeof result.diagnostico_perfil !== "string") {
    throw new Error("Gemini no pudo generar el informe. Revisa la configuración del servidor.");
  }
  return result;
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
  let finished = false;
  const fail = (message) => {
    if (finished) return;
    finished = true;
    onError?.(message);
  };

  let socket;
  try {
    const url = new URL("/ws/scrape", getBackendUrl());
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(url.toString());
  } catch {
    fail("No se pudo iniciar la conexión con el servidor. Revisa la dirección.");
    return null;
  }

  socket.onopen = () => {
    try {
      socket.send(JSON.stringify({
        username,
        target,
        max_videos: Number(max_videos),
        max_comment_videos: Number(max_comment_videos),
        max_following: Number(max_following),
        max_followers: Number(max_followers)
      }));
    } catch {
      fail("No se pudo enviar la solicitud al servidor.");
      socket.close();
    }
  };

  socket.onmessage = (event) => {
    if (finished) return;
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      fail("No se pudo interpretar la respuesta del servidor.");
      socket.close();
      return;
    }
    if (!msg || typeof msg !== "object") {
      fail("Respuesta del servidor no válida.");
      socket.close();
      return;
    }
    if (msg.type === "log") onLog?.(msg.message);
    if (msg.type === "result") {
      finished = true;
      onResult?.(msg.data);
    }
    if (msg.type === "error") fail(msg.message || "Error del servidor.");
  };

  socket.onerror = () => fail("No se pudo conectar con el servidor.");
  socket.onclose = () => {
    if (!finished) fail("La conexión terminó antes de recibir los resultados.");
  };
  return socket;
};
