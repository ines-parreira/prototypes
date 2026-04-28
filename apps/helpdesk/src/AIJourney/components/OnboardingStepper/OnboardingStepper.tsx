import {
    Stepper as AxiomStepper,
    StepperItemState,
    StepperTabItem,
    StepperTabList,
} from '@gorgias/axiom'

import type { STEPS_NAMES } from 'AIJourney/constants'
import { JOURNEY_ONBOARDING_STEPS } from 'AIJourney/constants'

type StepDefinition = (typeof JOURNEY_ONBOARDING_STEPS)[number]

export const OnboardingStepper = ({
    step,
    currentStepIndex,
    onStepClick,
    steps = JOURNEY_ONBOARDING_STEPS,
}: {
    step: STEPS_NAMES
    currentStepIndex: number
    onStepClick: (stepName: STEPS_NAMES) => void
    steps?: StepDefinition[]
}) => {
    const getStepState = (index: number) => {
        if (index < currentStepIndex) return StepperItemState.Done
        else if (index === currentStepIndex) return StepperItemState.Current
        return StepperItemState.Default
    }
    return (
        <AxiomStepper selectedItem={step}>
            <StepperTabList>
                {steps.map((s, index) => {
                    const state = getStepState(index)
                    return (
                        <StepperTabItem
                            id={s.name}
                            key={s.name}
                            stepNumber={s.stepNumber}
                            label={s.label}
                            state={state}
                            onClick={() => onStepClick(s.name)}
                        />
                    )
                })}
            </StepperTabList>
        </AxiomStepper>
    )
}
