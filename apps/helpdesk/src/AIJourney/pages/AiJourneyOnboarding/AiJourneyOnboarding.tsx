import React from 'react'

import { OnboardingStepSelector } from 'AIJourney/components/OnboardingStepSelector/OnboardingStepSelector'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import lightningIcon from 'assets/img/ai-journey/lightning.svg'

import css from './AiJourneyOnboarding.less'

type AiJourneyOnboardingProps = {
    journeyType: string
    step: string
    stepComponent: React.ComponentType
}

export const AiJourneyOnboarding = ({
    journeyType,
    step,
    stepComponent: StepComponent,
}: AiJourneyOnboardingProps) => {
    const JOURNEY_ONBOARDING_STEPS = [
        {
            name: STEPS_NAMES.SETUP,
            indicator: 1,
        },
        {
            name: STEPS_NAMES.TEST,
            indicator: 2,
        },
        {
            name: STEPS_NAMES.ACTIVATE,
            indicator: 3,
        },
    ]

    const headerTitle =
        journeyType === JOURNEY_TYPES.CART_ABANDONMENT
            ? 'SMS Cart Abandoned flow'
            : 'SMS Browse Abandoned flow'

    return (
        <div className={css.container}>
            <div className={css.header}>
                <img src={lightningIcon} alt="lightning" />
                <span>{headerTitle}</span>
            </div>
            <OnboardingStepSelector
                steps={JOURNEY_ONBOARDING_STEPS}
                activeStep={step}
            />
            <StepComponent />
        </div>
    )
}
