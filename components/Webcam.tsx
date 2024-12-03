"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

function WebcamComponent({
  onCameraReady,
  onMicReady,
}: {
  onCameraReady?: () => void;
  onMicReady?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    let videoElement: HTMLVideoElement | null = null;
    const setupWebcam = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: true,
        };
        const stream: MediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoElement = videoRef.current;
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            videoElement?.play();
            onCameraReady?.();
          };
        }

        // Check microphone tracks
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          onMicReady?.();
        }

        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof DOMException
            ? getErrorMessage(err.name)
            : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error accessing webcam:", err);
      }
    };
    setIsClient(true);
    setupWebcam();
    return () => {
      if (videoElement?.srcObject instanceof MediaStream) {
        videoElement.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onCameraReady, onMicReady]);

  const getErrorMessage = (errorName: string): string => {
    const errorMessages: { [key: string]: string } = {
      NotAllowedError: "Camera or microphone permission was denied",
      NotFoundError: "No camera or microphone found on this device",
      OverconstrainedError:
        "No camera or microphone meets the specified constraints",
      AbortError: "Camera or microphone access was aborted",
      SecurityError: "Security error accessing the camera or microphone",
    };
    return errorMessages[errorName] || "Unexpected access error";
  };

  if (!isClient) return null;
  return (
    <>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="max-w-full h-auto border rounded-lg shadow-lg"
      />
    </>
  );
}

export default dynamic(() => Promise.resolve(WebcamComponent), {
  ssr: false,
});
