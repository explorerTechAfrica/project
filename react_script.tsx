import { useEffect, useRef } from "react";

const CameraStream = () => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ws = new WebSocket("wss://YOUR-RENDER-URL.onrender.com/stream");

    ws.onmessage = (event) => {
      const blob = new Blob([event.data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      if (imgRef.current) {
        imgRef.current.src = url;
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <h1>Live Stream</h1>
      <img ref={imgRef} alt="Live Feed" style={{ width: "100%" }} />
    </div>
  );
};

export default CameraStream;
