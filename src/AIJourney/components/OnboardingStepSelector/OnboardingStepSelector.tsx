import { OnboardingStep } from './OnboardingStep/OnboardingStep'

import css from './OnboardingStepSelector.less'

type OnboardingStepSelectorProps = {
    steps: {
        stepName: string
        stepIndicator: number
    }[]
    activeStep?: string
}

export const OnboardingStepSelector = ({
    steps,
    activeStep,
}: OnboardingStepSelectorProps) => {
    return (
        <div className={css.onboardingSteps}>
            {steps.map(({ stepName, stepIndicator }, index) => (
                <OnboardingStep
                    key={index}
                    stepName={stepName}
                    stepIndicator={stepIndicator}
                    isActive={activeStep === stepName}
                />
            ))}
        </div>
    )
}
