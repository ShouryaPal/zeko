"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

interface WebcamProps {
  onCameraReady?: () => void;
  onMicReady?: () => void;
  existingStream?: MediaStream | null;
}

function WebcamComponent({
  onCameraReady,
  onMicReady,
  existingStream,
}: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    let videoElement: HTMLVideoElement | null = null;
    let mediaStream: MediaStream | null = null;

    const setupWebcam = async () => {
      try {
        if (existingStream) {
          mediaStream = existingStream;
        } else {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Browser doesn't support media devices");
          }

          const constraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
            audio: true,
          };

          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        }

        if (videoRef.current) {
          videoElement = videoRef.current;
          videoElement.srcObject = mediaStream;

          videoElement.onloadedmetadata = () => {
            videoElement?.play().catch((playError) => {
              console.warn("Video play error:", playError);
            });
            onCameraReady?.();
          };

          const audioTracks = mediaStream.getAudioTracks();
          if (audioTracks.length > 0) {
            onMicReady?.();
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          let errorMessage = "An unknown error occurred";

          if (err instanceof DOMException) {
            switch (err.name) {
              case "NotAllowedError":
                errorMessage =
                  "Please allow camera and microphone access to continue";
                break;
              case "NotFoundError":
                errorMessage = "No camera or microphone found on this device";
                break;
              case "NotReadableError":
                errorMessage = "Your camera or microphone is already in use";
                break;
              case "OverconstrainedError":
                errorMessage = "Camera requirements could not be satisfied";
                break;
              default:
                errorMessage = err.message;
            }
          }

          console.warn("Media access error:", errorMessage);
        }
      }
    };

    setIsClient(true);
    setupWebcam();

    return () => {
      if (mediaStream && !existingStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [onCameraReady, onMicReady, existingStream]);

  if (!isClient) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="max-w-full h-auto border rounded-lg shadow-lg"
    />
  );
}

export default dynamic(() => Promise.resolve(WebcamComponent), {
  ssr: false,
});
