"use client";
import { useState } from "react";
import Webcam from "@/components/Webcam";
import HeaderSection from "@/components/HeaderSection";
import PermissionSection from "@/components/PermissionSection";
import InstructionSection from "@/components/InstructionSection";
import { Button } from "@/components/ui/button";
import QuestionsScreen from "@/components/QuestionScreen";

function Home() {
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [isMicReady, setIsMicReady] = useState<boolean>(false);
  const [isScreenShareReady, setIsScreenShareReady] = useState<boolean>(false);
  const [permissionToggle, setPermissionToggle] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [questionsScreen, setQuestionsScreen] = useState<boolean>(false);

  return (
    <div className="bg-gray-900 h-screen w-full ">
      {questionsScreen ? (
        <QuestionsScreen />
      ) : permissionGranted ? (
        <div className="h-screen flex flex-col items-center justify-center text-white gap-3">
          <h1 className="text-3xl ">Important Interview Instructions</h1>
          <ol className="list-decimal">
            <li>
              Do not attempt to navigate away from this page(Do not press back
              button).
            </li>
            <li>Maintain fullscreen mode throughout the interview</li>
            <li>Keep your face clearly visible and centered</li>
            <li>Ensure stable internet connection</li>
          </ol>
          <Button
            className="bg-violet-600 hover:bg-violet-400"
            onClick={() => setQuestionsScreen(true)}
          >
            Lets Start
          </Button>
        </div>
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
