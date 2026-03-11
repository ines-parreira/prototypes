import {
    Stepper as AxiomStepper,
    StepperItemState,
    StepperTabItem,
    StepperTabList,
} from '@gorgias/axiom'

import type { STEPS_NAMES } from 'AIJourney/constants'
import { JOURNEY_ONBOARDING_STEPS } from 'AIJourney/constants'

export const OnboardingStepper = ({
    step,
    currentStepIndex,
}: {
    step: STEPS_NAMES
    currentStepIndex: number
}) => {
    const getStepState = (index: number) => {
        if (index < currentStepIndex) return StepperItemState.Done
        else if (index === currentStepIndex) return StepperItemState.Current
        return StepperItemState.Default
    }
    return (
        <AxiomStepper selectedItem={step}>
            <StepperTabList>
                {JOURNEY_ONBOARDING_STEPS.map((s, index) => (
                    <StepperTabItem
                        id={s.name}
                        key={s.name}
                        stepNumber={s.stepNumber}
                        label={s.label}
                        state={getStepState(index)}
                    />
                ))}
            </StepperTabList>
        </AxiomStepper>
    )
}
