"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "@/components/Webcam";
import { Video, Mic, Loader2, Airplay } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import HeaderSection from "@/components/HeaderSection";

function Home() {
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [isMicReady, setIsMicReady] = useState<boolean>(false);
  const [isScreenShareReady, setIsScreenShareReady] = useState<boolean>(false);
  const [permissionToggle, setPermissionToggle] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  return (
    <div className="bg-gray-900 h-screen w-full ">
      {permissionGranted ? (
        <div>Hello Permissions are done</div>
      ) : (
        <div className="grid grid-cols-2">
          <div className="flex flex-col justify-center p-28">
            <h1 className="text-xl font-bold text-white mb-4">AI Interview</h1>
            <Webcam
              onCameraReady={() => setIsCameraReady(true)}
              onMicReady={() => setIsMicReady(true)}
            />
          </div>

          <div className="flex flex-col justify-center p-28 gap-4">
            <HeaderSection />
            {permissionToggle ? (
              <ReadySection
                isCameraReady={isCameraReady}
                isMicReady={isMicReady}
                isScreenShareReady={isScreenShareReady}
                setIsScreenShareReady={setIsScreenShareReady}
                setPermissionGranted={setPermissionGranted}
              />
            ) : (
              <InstructionSection onStart={() => setPermissionToggle(true)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Home;

function InstructionSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col gap-2 text-white">
      <h1 className="text-2xl font-semibold">Instructions</h1>
      <ol className="list-decimal list-inside space-y-1 text-base">
        <li>Ensure stable internet and choose a clean, quiet location.</li>
        <li>
          Permission for access to camera, microphone, and entire screen sharing
          is required.
        </li>
        <li>Be in professional attire and avoid distractions.</li>
        <li>
          Give a detailed response, providing as much information as you can.
        </li>
        <li>
          Answer the question with examples and projects you've worked on.
        </li>
      </ol>
      <Button
        className="w-full bg-violet-700 font-semibold hover:bg-violet-500 mt-4"
        onClick={onStart}
      >
        Start Now
      </Button>
    </div>
  );
}

function ReadySection({
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

  const handleScreenShare = async () => {
    setIsChecking((prev) => ({ ...prev, screen: true }));
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      if (stream) {
        setIsScreenShareReady(true);
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Screen share error:", error);
      setIsScreenShareReady(false);
    }
    setIsChecking((prev) => ({ ...prev, screen: false }));
  };

  const handleSubmit = () => {
    if (isCameraReady && isMicReady && isScreenShareReady) {
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
        disabled={!isCameraReady || !isMicReady || !isScreenShareReady}
      >
        Start Interview
      </Button>
    </div>
  );
}
