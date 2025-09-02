import { OnboardingStep } from './OnboardingStep/OnboardingStep'

import css from './OnboardingStepSelector.less'

type OnboardingStepSelectorProps = {
    steps: {
        name: string
        indicator: number
    }[]
    activeStep?: string
}

export const OnboardingStepSelector = ({
    steps,
    activeStep,
}: OnboardingStepSelectorProps) => {
    return (
        <div className={css.onboardingSteps}>
            {steps.map(({ name, indicator }, index) => (
                <OnboardingStep
                    key={index}
                    stepName={name}
                    stepIndicator={indicator}
                    isActive={activeStep === name}
                />
            ))}
        </div>
    )
}
