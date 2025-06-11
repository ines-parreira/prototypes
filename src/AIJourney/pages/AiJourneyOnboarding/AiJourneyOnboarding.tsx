import { OnboardingStepSelector } from 'AIJourney/components/OnboardingStepSelector/OnboardingStepSelector'

import { OnboardingCard } from '../../components/OnboardingCard/OnboardingCard'

import css from './AiJourneyOnboarding.less'

interface AiJourneyOnboardingProps {
    step?: string
}

export const AiJourneyOnboarding = ({
    step = 'conversation-setup',
}: AiJourneyOnboardingProps) => {
    const isActivationStep = step === 'activation'

    const steps = [
        {
            stepName: 'Conversation setup',
            stepIndicator: 1,
            isActive: !isActivationStep,
        },
        {
            stepName: 'Activation',
            stepIndicator: 2,
            isActive: isActivationStep,
        },
    ]

    return (
        <div className={css.container}>
            <OnboardingStepSelector steps={steps} />
            <OnboardingCard
                currentStep={
                    isActivationStep ? 'Activation' : 'Conversation Setup'
                }
            />
        </div>
    )
}
