"use client";

import React, { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  title: string;
  content: ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export function MultiStepForm({
  steps,
  onComplete,
  onCancel,
  submitButtonText = "Submit",
  cancelButtonText = "Cancel",
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === steps.length - 1) {
      onComplete();
    } else {
      goToNextStep();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 transform bg-gray-200 dark:bg-gray-700"></div>
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                    index <= currentStep
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  {index < currentStep ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="mb-8"
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          className="flex items-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onClick={currentStep === 0 ? onCancel : goToPreviousStep}
        >
          {currentStep === 0 ? cancelButtonText : "Previous"}
        </button>
        <button
          type={currentStep === steps.length - 1 ? "submit" : "button"}
          className="flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={currentStep === steps.length - 1 ? undefined : goToNextStep}
        >
          <span>{currentStep === steps.length - 1 ? submitButtonText : "Next"}</span>
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                currentStep === steps.length - 1
                  ? "M5 13l4 4L19 7" // Checkmark for final step
                  : "M14 5l7 7m0 0l-7 7m7-7H3" // Right arrow for next
              }
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
