import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExampleCarouselProps {
  examples: string[];
  interval?: number;
}

export const ExampleCarousel: React.FC<ExampleCarouselProps> = ({ 
  examples, 
  interval = 3000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examples.length);
    }, interval);

    return () => clearInterval(timer);
  }, [examples.length, interval]);

  return (
    <div className="relative h-8 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-gray-700 italic text-lg text-center">
            "{examples[currentIndex]}"
          </span>
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {examples.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
            aria-label={`Ir para exemplo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};