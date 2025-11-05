import React from 'react'

import { OnboardingStepSelector } from 'AIJourney/components/OnboardingStepSelector/OnboardingStepSelector'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'
import lightningIcon from 'assets/img/ai-journey/lightning.svg'

import css from './AiJourneyOnboarding.less'

interface StepComponentProps {
    journeyType: JOURNEY_TYPES
}

type AiJourneyOnboardingProps = {
    journeyType: JOURNEY_TYPES
    step: string
    stepComponent: React.ComponentType<StepComponentProps>
}

export const AiJourneyOnboarding = ({
    journeyType,
    step,
    stepComponent: StepComponent,
}: AiJourneyOnboardingProps) => {
    const { journeyData } = useJourneyContext()

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

    const titleMapping = {
        [JOURNEY_TYPES.CART_ABANDONMENT]: 'SMS Cart Abandoned flow',
        [JOURNEY_TYPES.SESSION_ABANDONMENT]: 'SMS Browse Abandoned flow',
        [JOURNEY_TYPES.WIN_BACK]: 'Win-Back flow',
        [JOURNEY_TYPES.CAMPAIGN]: journeyData
            ? journeyData.campaign?.title
            : 'Create New Campaign',
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                {journeyType !== JOURNEY_TYPES.CAMPAIGN && (
                    <img src={lightningIcon} alt="lightning" />
                )}
                <span>{titleMapping[journeyType]}</span>
            </div>
            <OnboardingStepSelector
                steps={JOURNEY_ONBOARDING_STEPS}
                activeStep={step}
            />
            <StepComponent journeyType={journeyType} />
        </div>
    )
}
