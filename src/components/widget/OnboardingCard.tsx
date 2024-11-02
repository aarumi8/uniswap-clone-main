import React from 'react';
import { Button } from "@src/components/ui/button";
export interface OnboardingStep {
    target: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
  }

interface OnboardingCardProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  targetRect: DOMRect;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  targetRect,
}) => {
  const getCardPosition = () => {
    const padding = 12;
    let top = 0;
    let left = targetRect.left;

    switch (step.placement) {
      case 'top':
        top = targetRect.top - padding - 150; // card height
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        break;
      case 'left':
        left = targetRect.left - padding - 300; // card width
        top = targetRect.top;
        break;
      case 'right':
        left = targetRect.right + padding;
        top = targetRect.top;
        break;
    }

    return { top, left };
  };

  const { top, left } = getCardPosition();

  return (
    <>
      {/* Target element highlight */}
      <div
        className="absolute bg-white/10 border-2 border-primary-500 rounded-lg transition-all duration-300"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8
        }}
      />

      {/* Guide card */}
      <div 
        className="absolute p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg pointer-events-auto max-w-xs"
        style={{ top, left }}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {step.content}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onSkip}
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={onNext}
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};