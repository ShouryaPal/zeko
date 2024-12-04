import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface FeedbackScreenProps {
  recordings: {
    questionId: number;
    videoBlob: Blob;
    audioBlob: Blob;
  }[];
  onSubmit: (feedback: string) => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ onSubmit }) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (feedback.trim().length < 10) {
      toast.error("Please provide more detailed feedback");
      return;
    }

    onSubmit(feedback);
    toast.success("Feedback submitted successfully!");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center text-white gap-6 px-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-8 shadow-lg">
        <h2 className="text-3xl mb-6 text-center">Interview Feedback</h2>

        <div className="mb-6">
          <label
            htmlFor="feedback"
            className="block text-xl mb-4 text-gray-300"
          >
            What areas do you think you can improve in?
          </label>
          <Textarea
            id="feedback"
            className="w-full min-h-[200px] bg-gray-700 text-white border-none focus:ring-2 focus:ring-violet-600"
            placeholder="Share your thoughts on your performance, areas of improvement, and any challenges you faced during the interview..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <Button
            className="bg-violet-600 hover:bg-violet-500 px-8 py-3 text-lg"
            onClick={handleSubmit}
          >
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackScreen;
