"use client";
import { useState } from "react";
import {
  Video,
  Mic,
  Loader2,
  Airplay,
  Volume2,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "./ui/button";

export default function PermissionSection({
  isCameraReady,
  isMicReady,
  isScreenShareReady,
  setIsScreenShareReady,
  setPermissionGranted,
}: {
  isCameraReady: boolean;
  isMicReady: boolean;
  isScreenShareReady: boolean;
  setIsScreenShareReady: (ready: boolean) => void;
  setPermissionGranted: (granted: boolean) => void;
}) {
  const [isChecking, setIsChecking] = useState({
    camera: false,
    mic: false,
    screen: false,
  });
  const [showSpeakerTest, setShowSpeakerTest] = useState(false);
  const [isSpeakerReady, setIsSpeakerReady] = useState(false);
  const [audio] = useState(new Audio("/voices/One.mp3"));

  const speakerTest = () => {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    setShowSpeakerTest(true);
  };

  const handleScreenShare = async () => {
    setIsChecking((prev) => ({ ...prev, screen: true }));
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      if (stream) {
        if (!document.fullscreenElement) {
          document.documentElement
            .requestFullscreen()
            .then(() => {
              setIsScreenShareReady(true);
            })
            .catch((err) => {
              console.error(
                `Error attempting to enable full-screen mode: ${err.message}`,
              );
            });
        }

        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Screen share error:", error);
      setIsScreenShareReady(false);
    }
    setIsChecking((prev) => ({ ...prev, screen: false }));
  };

  const handleSubmit = () => {
    if (isCameraReady && isMicReady && isSpeakerReady && isScreenShareReady) {
      setPermissionGranted(true);
    } else {
      alert("Please ensure all permissions are granted before proceeding.");
    }
  };

  return (
    <div className="flex flex-col gap-2 text-white">
      <h1 className="text-2xl font-semibold">Ready to join?</h1>
      <p className="text-zinc-500">
        Please make sure your device is properly configured.
      </p>

      <Card className="flex items-center justify-between bg-transparent rounded-md border-[1px] px-4 py-2">
        <div className="flex items-center gap-3 text-white">
          <Video size={16} />
          <h1>Camera Access</h1>
        </div>
        {isChecking.camera ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Checkbox
            id="camera"
            className="border-white"
            checked={isCameraReady}
            disabled
          />
        )}
      </Card>

      <Card className="flex items-center justify-between bg-transparent rounded-md border-[1px] px-4 py-2">
        <div className="flex items-center gap-3 text-white">
          <Mic size={16} />
          <h1>Microphone Access</h1>
        </div>
        {isChecking.mic ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Checkbox
            id="microphone"
            className="border-white"
            checked={isMicReady}
            disabled
          />
        )}
      </Card>

      <Card className="flex items-center justify-between bg-transparent rounded-md border-[1px] px-4 py-2">
        <div className="flex items-center gap-3 text-white">
          <Volume2 size={16} />
          <h1>Check Speaker</h1>
        </div>
        {!isSpeakerReady && !showSpeakerTest && (
          <Button
            variant="outline"
            size="sm"
            onClick={speakerTest}
            className="text-xs"
          >
            Test
          </Button>
        )}
        {isSpeakerReady && (
          <Checkbox
            id="speaker"
            className="border-white"
            checked={true}
            disabled
          />
        )}
      </Card>

      {showSpeakerTest && !isSpeakerReady && (
        <Card className="flex items-center justify-between rounded-md border-[1px] px-4 py-2 bg-violet-900/20">
          <div className="flex items-center gap-3 text-white">
            <MessageSquare size={16} />
            <h1>Are you able to listen?</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSpeakerReady(true);
                setShowSpeakerTest(false);
              }}
              className="text-xs"
            >
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={speakerTest}
              className="text-xs"
            >
              Replay
            </Button>
          </div>
        </Card>
      )}
      <Card className="flex items-center justify-between bg-transparent rounded-md border-[1px] px-4 py-2">
        <div className="flex items-center gap-3 text-white">
          <Airplay size={16} />
          <h1>Screen Share Access</h1>
        </div>
        {isChecking.screen ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            {!isScreenShareReady && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleScreenShare}
                className="text-xs"
              >
                Enable
              </Button>
            )}
            {isScreenShareReady && (
              <Checkbox
                id="screen-share"
                className="border-white"
                checked={true}
                disabled
              />
            )}
          </>
        )}
      </Card>
      <Button
        className="w-full bg-violet-700 font-semibold hover:bg-violet-500 mt-4"
        onClick={handleSubmit}
        disabled={
          !isCameraReady ||
          !isMicReady ||
          !isSpeakerReady ||
          !isScreenShareReady
        }
      >
        Start Interview
      </Button>
    </div>
  );
}
