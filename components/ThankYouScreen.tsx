import { motion } from "framer-motion";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

interface ThankYouScreenProps {
  feedback: string;
}

const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ feedback }) => {
  const { width, height } = useWindowSize();

  const confettiColors = [
    "#a864fd",
    "#29cdff",
    "#78ff44",
    "#ff718d",
    "#fdff6a",
  ];

  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-violet-900 to-purple-700 overflow-hidden">
      <Confetti
        width={width}
        height={height}
        colors={confettiColors}
        recycle={false}
        numberOfPieces={500}
        gravity={0.1}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 120,
        }}
        className="text-center z-10 px-6"
      >
        <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">
          Thank You for Your Interview!
        </h1>

        <div className="max-w-2xl mx-auto bg-white/20 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <p className="text-2xl mb-4">
            We appreciate your time and valuable feedback.
          </p>

          <div className="mt-6 italic text-xl text-gray-100">
            <p className="mb-2">Your Feedback:</p>
            <blockquote className="bg-white/10 p-4 rounded-lg">
              {feedback}
            </blockquote>
          </div>
        </div>

        <h1 className="text-2xl font-bold mt-6 drop-shadow-lg">
          Now you can leave this site
        </h1>
      </motion.div>
    </div>
  );
};

export default ThankYouScreen;
