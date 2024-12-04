import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const LoadingScreen = () => {
  const [randomPhrase, setRandomPhrase] = useState("");

  const funnyPhrases = [
    "Polishing your genius moments...",
    "Calibrating interview awesomeness...",
    "Summoning interview superpowers...",
    "Brewing interview magic...",
    "Extracting your inner rockstar...",
    "Preparing epic response mode...",
    "Charging confidence batteries...",
  ];

  useEffect(() => {
    setRandomPhrase(
      funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)],
    );
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-900 to-purple-700 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="animate-pulse text-6xl mb-6">🚀</div>
        <h2 className="text-3xl font-bold mb-4">Preparing Next Question</h2>
        <p className="text-xl">{randomPhrase}</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
