import { OnboardingStep } from './OnboardingStep/OnboardingStep'

import css from './OnboardingStepSelector.less'

interface OnboardingStepSelectorProps {
    steps: {
        stepName: string
        stepIndicator: number
        isActive: boolean
    }[]
}

export const OnboardingStepSelector: React.FC<OnboardingStepSelectorProps> = ({
    steps,
}) => {
    return (
        <div className={css.onboardingSteps}>
            {steps.map(({ stepName, stepIndicator, isActive }, index) => (
                <OnboardingStep
                    key={index}
                    stepName={stepName}
                    stepIndicator={stepIndicator}
                    isActive={isActive}
                />
            ))}
        </div>
    )
}
