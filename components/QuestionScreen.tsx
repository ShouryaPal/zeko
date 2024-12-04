"use client";
import { useState, useEffect, useRef } from "react";
import { questions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Webcam from "@/components/Webcam";
import { toast } from "sonner";
import FeedbackScreen from "./FeedbackScreen";
import ThankYouScreen from "./ThankYouScreen";
import LoadingScreen from "./LoadingScreen";

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
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const cleanupMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    if (videoMediaRecorderRef.current) {
      videoMediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => {
    const initializeFirstQuestion = async () => {
      try {
        setIsTimerActive(true);
        await startRecording();
        if (audioRef.current) {
          audioRef.current.play();
        }
      } catch (error) {
        handleMediaError(error);
      }
    };

    initializeFirstQuestion();

    return () => {
      cleanupMediaStream();
    };
  }, []);

  useEffect(() => {
    if (currentQuestionIndex > 0) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        try {
          setIsLoading(false);
          setTimeLeft(60);
          setIsTimerActive(true);
          await startRecording();
          if (audioRef.current) {
            audioRef.current.play();
          }
        } catch (error: unknown) {
          setIsLoading(false);
          handleMediaError(error);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
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
    const analyzeAudio = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
      }
      if (isRecording) {
        requestAnimationFrame(analyzeAudio);
      }
    };

    if (isRecording) {
      analyzeAudio();
    }
  }, [isRecording]);

  const handleMediaError = (error: Error) => {
    let errorMessage = "Failed to access media devices";

    switch (error.name) {
      case "NotReadableError":
        errorMessage =
          "Camera or microphone is already in use or not available";
        break;
      case "NotAllowedError":
        errorMessage =
          "Media access was denied. Please check your browser permissions";
        break;
      case "NotFoundError":
        errorMessage = "No camera or microphone found on this device";
        break;
      default:
        errorMessage = error.message || "Unexpected media access error";
    }

    setMediaError(errorMessage);
    toast.error(errorMessage);
    console.error("Media Device Error:", error);
  };

  const startRecording = async () => {
    cleanupMediaStream();
    setMediaError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      analyserRef.current = audioContext.createAnalyser();

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      videoMediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);

      videoMediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      videoMediaRecorderRef.current.start(1000);
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      handleMediaError(error);
      throw error;
    }
  };

  const stopRecording = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (
        videoMediaRecorderRef.current &&
        videoMediaRecorderRef.current.state === "recording"
      ) {
        videoMediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      cleanupMediaStream();
    } catch (error) {
      console.error("Error stopping recording:", error);
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

    console.log(`Question ${currentQuestionIndex + 1} Recordings:`, {
      video: videoUrl,
      audio: audioUrl,
    });
  };

  const handleSubmit = async () => {
    try {
      stopRecording();
      saveRecording();
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsInterviewComplete(true);
        toast.success("Interview completed!");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer");
    }
  };

  const handleFeedbackSubmit = (feedback: string) => {
    setSubmittedFeedback(feedback);
    console.log("Interview Feedback:", feedback);
    console.log("Recordings:", recordings);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (mediaError) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-red-600">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Media Access Error</h2>
          <p>{mediaError}</p>
          <Button
            className="mt-4 bg-white text-red-600 hover:bg-gray-100"
            onClick={() => {
              setMediaError(null);
              startRecording();
            }}
          >
            Retry Media Access
          </Button>
        </div>
      </div>
    );
  }

  if (isInterviewComplete) {
    if (submittedFeedback) {
      return <ThankYouScreen feedback={submittedFeedback} />;
    }
    return (
      <FeedbackScreen recordings={recordings} onSubmit={handleFeedbackSubmit} />
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center text-white gap-6">
      <div className="grid grid-cols-2 gap-8 w-full max-w-6xl px-4">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg overflow-hidden">
            <Webcam existingStream={streamRef.current} />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 transition-all duration-100"
                style={{ width: `${(audioLevel / 255) * 100}%` }}
              />
            </div>
            <p className="text-sm mt-2 text-center">Audio Level</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl mb-4">
              Question {currentQuestionIndex + 1}/{questions.length}
            </h2>
            <p className="text-xl">{currentQuestion.question}</p>
          </div>

          <div className="text-2xl text-center">
            Time Remaining: {timeLeft} seconds
          </div>
          <Button
            className="bg-green-600 hover:bg-green-500"
            onClick={handleSubmit}
          >
            Submit Answer
          </Button>
        </div>
      </div>

      <audio ref={audioRef} src={currentQuestion.audio} />
    </div>
  );
};

export default QuestionsScreen;
