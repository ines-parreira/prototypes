import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { OnboardingStepSelector } from 'AIJourney/components/OnboardingStepSelector/OnboardingStepSelector'
import { LEGACY_STEPS_NAMES, STEPS_NAMES } from 'AIJourney/constants'
import { JourneyProvider } from 'AIJourney/providers'
import lightningIcon from 'assets/img/ai-journey/lightning.svg'
import { useFlag } from 'core/flags'

import css from './AiJourneyOnboarding.less'

type AiJourneyOnboardingProps = {
    step: string
    stepComponent: React.ReactNode
}

export const AiJourneyOnboarding = ({
    step,
    stepComponent,
}: AiJourneyOnboardingProps) => {
    const isAiJourneyPlaygroundEnabled = useFlag(
        FeatureFlagKey.AiJourneyPlaygroundEnabled,
    )

    const LEGACY_ONBOARDING_STEPS = [
        {
            name: LEGACY_STEPS_NAMES.CONVERSATION_SETUP,
            indicator: 1,
        },
        {
            name: LEGACY_STEPS_NAMES.ACTIVATION,
            indicator: 2,
        },
    ]

    const ONBOARDING_STEPS = [
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

    const JOURNEY_ONBOARDING_STEPS = isAiJourneyPlaygroundEnabled
        ? ONBOARDING_STEPS
        : LEGACY_ONBOARDING_STEPS

    return (
        <JourneyProvider journeyType="cart_abandoned">
            <div className={css.container}>
                <div className={css.header}>
                    <img src={lightningIcon} alt="lightning" />
                    <span>SMS Abandoned Cart flow</span>
                </div>
                <OnboardingStepSelector
                    steps={JOURNEY_ONBOARDING_STEPS}
                    activeStep={step}
                />
                {stepComponent}
            </div>
        </JourneyProvider>
    )
}
