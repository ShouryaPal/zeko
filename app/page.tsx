"use client";
import { useState } from "react";
import Webcam from "@/components/Webcam";
import HeaderSection from "@/components/HeaderSection";
import PermissionSection from "@/components/PermissionSection";
import InstructionSection from "@/components/InstructionSection";

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
              <PermissionSection
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
