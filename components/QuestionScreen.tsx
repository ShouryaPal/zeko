"use client";
import { useState, useEffect, useRef } from "react";
import { questions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Webcam from "@/components/Webcam";
import { toast } from "sonner";

interface Recording {
  questionId: number;
  videoBlob: Blob;
  audioBlob: Blob;
}

const QuestionsScreen = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setTimeLeft(60);
    setIsTimerActive(false);
    setIsRecording(false);
    stopRecording();
  }, [currentQuestionIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (isRecording) {
      const analyzeAudio = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount,
          );
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
        }
        requestAnimationFrame(analyzeAudio);
      };
      analyzeAudio();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      videoChunksRef.current = [];
      audioChunksRef.current = [];

      // Get both video and audio streams
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Set up audio context and analyzer
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Split the stream into video and audio tracks
      const videoStream = new MediaStream([stream.getVideoTracks()[0]]);
      const audioStream = new MediaStream([stream.getAudioTracks()[0]]);

      // Set up video recorder
      videoMediaRecorderRef.current = new MediaRecorder(videoStream);
      videoMediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      // Set up audio recorder
      mediaRecorderRef.current = new MediaRecorder(audioStream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      videoMediaRecorderRef.current.start(1000); // Save video in 1-second chunks
      mediaRecorderRef.current.start(1000); // Save audio in 1-second chunks
      setIsRecording(true);

      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && videoMediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      videoMediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecording = () => {
    const videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" });
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    setRecordings((prev) => [
      ...prev,
      {
        questionId: currentQuestionIndex,
        videoBlob,
        audioBlob,
      },
    ]);

    const videoUrl = URL.createObjectURL(videoBlob);
    const audioUrl = URL.createObjectURL(audioBlob);

    const videoLink = document.createElement("a");
    videoLink.href = videoUrl;
    videoLink.download = `question_${currentQuestionIndex + 1}_video.webm`;
    videoLink.click();

    const audioLink = document.createElement("a");
    audioLink.href = audioUrl;
    audioLink.download = `question_${currentQuestionIndex + 1}_audio.webm`;
    audioLink.click();
  };

  const handleStart = () => {
    setIsTimerActive(true);
    startRecording();
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleSubmit = async () => {
    stopRecording();
    saveRecording();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      toast.success("Interview completed!");
      console.log("All recordings:", recordings);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center text-white gap-6">
      <div className="grid grid-cols-2 gap-8 w-full max-w-6xl px-4">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg overflow-hidden">
            <Webcam />
          </div>

          {isRecording && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 transition-all duration-100"
                  style={{ width: `${(audioLevel / 255) * 100}%` }}
                />
              </div>
              <p className="text-sm mt-2 text-center">Audio Level</p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl mb-4">
              Question {currentQuestionIndex + 1}/{questions.length}
            </h2>
            <p className="text-xl">{currentQuestion.question}</p>
          </div>

          {!isTimerActive && (
            <Button
              className="bg-violet-600 hover:bg-violet-400"
              onClick={handleStart}
            >
              Start Answer
            </Button>
          )}

          {isTimerActive && (
            <>
              <div className="text-2xl text-center">
                Time Remaining: {timeLeft} seconds
              </div>
              <Button
                className="bg-green-600 hover:bg-green-500"
                onClick={handleSubmit}
              >
                Submit Answer
              </Button>
            </>
          )}
        </div>
      </div>

      <audio ref={audioRef} src={currentQuestion.audio} />
    </div>
  );
};

export default QuestionsScreen;
