import { OnboardingStepSelector } from 'AIJourney/components/OnboardingStepSelector/OnboardingStepSelector'
import { STEPS_NAMES } from 'AIJourney/constants'
import { JourneyProvider } from 'AIJourney/providers'
import lightningIcon from 'assets/img/ai-journey/lightning.svg'

import { Activation } from '../Activation/Activation'
import { Setup } from '../Setup/Setup'

import css from './AiJourneyOnboarding.less'

type AiJourneyOnboardingProps = {
    step: string
}

export const AiJourneyOnboarding = ({ step }: AiJourneyOnboardingProps) => {
    const ONBOARDING_STEPS = [
        {
            stepName: STEPS_NAMES.CONVERSATION_SETUP,
            stepIndicator: 1,
        },
        {
            stepName: STEPS_NAMES.ACTIVATION,
            stepIndicator: 2,
        },
    ]

    return (
        <JourneyProvider journeyType="cart_abandoned">
            <div className={css.container}>
                <div className={css.header}>
                    <img src={lightningIcon} alt="lightning" />
                    <span>SMS Abandoned Cart flow</span>
                </div>
                <OnboardingStepSelector
                    steps={ONBOARDING_STEPS}
                    activeStep={step}
                />
                {step === STEPS_NAMES.CONVERSATION_SETUP ? (
                    <Setup />
                ) : (
                    <Activation />
                )}
            </div>
        </JourneyProvider>
    )
}
