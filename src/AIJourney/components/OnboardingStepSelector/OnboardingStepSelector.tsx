import { OnboardingStep } from './OnboardingStep/OnboardingStep'

import css from './OnboardingStepSelector.less'

type OnboardingStepSelectorProps = {
    steps: {
        stepName: string
        stepIndicator: number
        isActive: boolean
    }[]
}

export const OnboardingStepSelector = ({
    steps,
}: OnboardingStepSelectorProps) => {
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
