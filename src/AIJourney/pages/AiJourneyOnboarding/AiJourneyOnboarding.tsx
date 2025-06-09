import { OnboardingStepSelector } from 'AIJourney/components/OnboardingStepSelector/OnboardingStepSelector'

import { OnboardingCard } from '../../components/OnboardingCard/OnboardingCard'

import css from './AiJourneyOnboarding.less'

export const AiJourneyOnboarding: React.FC<{ step?: string }> = ({
    step = 'conversation-setup',
}) => {
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
