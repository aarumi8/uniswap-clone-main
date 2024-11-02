'use client';

import { Button } from "@src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@src/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@src/components/ui/tooltip";
import { LayoutTemplate } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const ONBOARDING_STEPS = [
  {
    id: 'wallet',
    content: "Connect your wallet or view your connected account here",
    target: "[data-onboarding='wallet-button']",
    placement: 'bottom' as const
  },
  {
    id: 'swap',
    content: "Easily swap tokens with the best rates",
    target: "[data-onboarding='swap-button']",
    placement: 'bottom' as const
  },
  {
    id: 'assistant',
    content: "Need help? Ask our AI assistant anytime",
    target: ".bottom-6.right-10",
    placement: 'top' as const
  }
];

type OnboardingStep = {
  id: string;
  content: string;
  target: string;
  placement: 'top' | 'bottom';
};

function OnboardingCard({ 
  step, 
  onNext, 
  onSkip, 
  totalSteps, 
  currentStepIndex,
  isVisible 
}: { 
  step: OnboardingStep;
  onNext: () => void;
  onSkip: () => void;
  totalSteps: number;
  currentStepIndex: number;
  isVisible: boolean;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePosition = () => {
      const targetElement = document.querySelector(step.target);
      if (!targetElement || !cardRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      
      let left = targetRect.left;
      const cardWidth = 320;
      
      // Prevent card from going off-screen
      if (left + cardWidth > windowWidth) {
        left = windowWidth - cardWidth - 20;
      }

      // Calculate top position based on placement
      const top = step.placement === 'bottom' 
        ? targetRect.bottom + 12 
        : targetRect.top - cardRect.height - 12;

      setPosition({ top, left });
    };

    calculatePosition();

    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [step]);

  return createPortal(
    <div
      ref={cardRef}
      className={`fixed z-[60] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-80
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      style={{
        top: position.top,
        left: position.left
      }}
    >
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {step.content}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Step {currentStepIndex + 1} of {totalSteps}
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
            {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function EmbeddedWidget() {
  const [open, setOpen] = useState(false);
  const [onboardingState, setOnboardingState] = useState({
    isActive: false,
    currentStepIndex: 0,
    isAnimating: false
  });

  const startOnboarding = useCallback(() => {
    setOpen(false);
    setOnboardingState({
      isActive: true,
      currentStepIndex: 0,
      isAnimating: false
    });
  }, []);

  const endOnboarding = useCallback(() => {
    setOnboardingState(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);

  const handleNext = useCallback(() => {
    setOnboardingState(prev => {
      if (prev.currentStepIndex === ONBOARDING_STEPS.length - 1) {
        return {
          isActive: false,
          currentStepIndex: 0,
          isAnimating: false
        };
      }
      
      return {
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        isAnimating: true
      };
    });
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'START_ONBOARDING') {
        startOnboarding();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [startOnboarding]);

  // Handle visibility check for current step
  const currentStep = ONBOARDING_STEPS[onboardingState.currentStepIndex];
  const isStepVisible = useCallback(() => {
    if (!onboardingState.isActive) return false;
    const element = document.querySelector(currentStep.target);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }, [currentStep, onboardingState.isActive]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] p-6" 
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold">AI Widget</DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-[calc(90vh-120px)] bg-gray-50 rounded-xl overflow-hidden">
            <iframe
              src="https://uniswap-ai-helper-widget.vercel.app/"
              className="w-full h-full border-0"
              title="Embedded Widget"
            />
          </div>
        </DialogContent>
      </Dialog>

      {onboardingState.isActive && currentStep && (
        <OnboardingCard
          step={currentStep}
          onNext={handleNext}
          onSkip={endOnboarding}
          totalSteps={ONBOARDING_STEPS.length}
          currentStepIndex={onboardingState.currentStepIndex}
          isVisible={isStepVisible()}
        />
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              className="fixed bottom-6 right-10 shadow-md hover:shadow-lg transition-all"
              onClick={() => setOpen(true)}
            >
              Ask UNI AI
              <LayoutTemplate className="ml-2 h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open Widget</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

export default EmbeddedWidget;