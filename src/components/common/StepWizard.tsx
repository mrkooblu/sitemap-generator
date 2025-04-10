import React, { useState, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { FiCheck, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import Button from './Button';

const WizardContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
`;

const StepsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    overflow-x: auto;
    padding: ${({ theme }) => theme.spacing[3]};
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colors.gray[100]};
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.gray[300]};
      border-radius: ${({ theme }) => theme.borderRadius.full};
    }
  }
`;

interface StepItemProps {
  $active: boolean;
  $completed: boolean;
}

const StepItem = styled.div<StepItemProps>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transition.fast};
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ theme, $active, $completed }) => 
    $active ? theme.colors.primary : 
    $completed ? theme.colors.success : 
    theme.colors.gray[600]};
  font-weight: ${({ theme, $active }) => 
    $active ? theme.fontWeights.semibold : theme.fontWeights.normal};
  
  &:hover {
    background-color: ${({ theme, $active }) => 
      $active ? theme.colors.primaryLight : theme.colors.gray[100]};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
    white-space: nowrap;
  }
`;

const StepNumber = styled.div<StepItemProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing[2]};
  background-color: ${({ theme, $active, $completed }) => 
    $active ? theme.colors.primary : 
    $completed ? theme.colors.success :
    theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-right: ${({ theme }) => theme.spacing[1]};
  }
`;

const StepContent = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  animation: ${({ theme }) => theme.animation.fadeIn};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const StepNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export interface WizardStep {
  id: string;
  label: string;
  content: ReactNode;
}

interface StepWizardProps {
  steps: WizardStep[];
  onComplete?: () => void;
  initialStep?: number;
  allowSkip?: boolean;
}

const StepWizard: React.FC<StepWizardProps> = ({
  steps,
  onComplete,
  initialStep = 0,
  allowSkip = false,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Mark previous steps as completed whenever current step changes
  useEffect(() => {
    const newCompletedSteps = [...completedSteps];
    
    for (let i = 0; i < currentStep; i++) {
      if (!newCompletedSteps.includes(i)) {
        newCompletedSteps.push(i);
      }
    }
    
    setCompletedSteps(newCompletedSteps);
  }, [currentStep]);

  const handleStepClick = (index: number) => {
    if (allowSkip || index < currentStep || completedSteps.includes(index)) {
      setCurrentStep(index);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    } else {
      // If we're on the last step
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <WizardContainer>
      <StepsHeader>
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            $active={index === currentStep}
            $completed={completedSteps.includes(index)}
            onClick={() => handleStepClick(index)}
          >
            <StepNumber 
              $active={index === currentStep} 
              $completed={completedSteps.includes(index)}
            >
              {completedSteps.includes(index) ? <FiCheck size={14} /> : index + 1}
            </StepNumber>
            {step.label}
          </StepItem>
        ))}
      </StepsHeader>
      
      <StepContent>
        {steps[currentStep]?.content}
      </StepContent>
      
      <StepNavigation>
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          disabled={currentStep === 0}
        >
          <FiChevronLeft size={16} style={{ marginRight: '4px' }} />
          Previous
        </Button>
        
        <ButtonContainer>
          {!isLastStep && (
            <Button onClick={handleNext}>
              Next
              <FiChevronRight size={16} style={{ marginLeft: '4px' }} />
            </Button>
          )}
          
          {isLastStep && (
            <Button onClick={handleNext}>
              Finish
              <FiCheck size={16} style={{ marginLeft: '4px' }} />
            </Button>
          )}
        </ButtonContainer>
      </StepNavigation>
    </WizardContainer>
  );
};

export default StepWizard; 