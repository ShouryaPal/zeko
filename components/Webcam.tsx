"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

function WebcamComponent({
  onCameraReady,
  onMicReady,
}: {
  onCameraReady?: () => void;
  onMicReady?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    let videoElement: HTMLVideoElement | null = null;
    let mediaStream: MediaStream | null = null;

    const setupWebcam = async () => {
      try {
        // Check if browser supports getUserMedia
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

        if (videoRef.current) {
          videoElement = videoRef.current;
          videoElement.srcObject = mediaStream;

          videoElement.onloadedmetadata = () => {
            videoElement?.play().catch((playError) => {
              console.warn("Video play error:", playError);
              toast.error("Failed to play video stream");
            });
            onCameraReady?.();
            toast.success("Camera connected successfully");
          };

          const audioTracks = mediaStream.getAudioTracks();
          if (audioTracks.length > 0) {
            onMicReady?.();
            toast.success("Microphone connected successfully");
          }
        }
      } catch (err) {
        // Type guard to ensure err is Error type
        if (err instanceof Error) {
          let errorMessage = "An unknown error occurred";

          // Handle specific DOMException cases
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

          toast.error("Camera Access Error", {
            description: errorMessage,
            duration: 5000,
            dismissible: true,
          });

          console.warn("Media access error:", errorMessage);
        }
      }
    };

    setIsClient(true);
    setupWebcam();

    // Cleanup function
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [onCameraReady, onMicReady]);

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

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(WebcamComponent), {
  ssr: false,
});
