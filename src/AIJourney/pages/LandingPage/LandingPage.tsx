import Icon from 'AIJourney/assets/AI-intro-icon.svg'
import { OnboardingStepSelector } from 'AIJourney/components'

import css from './LandingPage.less'

export const LandingPage = () => {
    const steps = [
        { stepName: 'Conversation setup', stepIndicator: 1, isActive: true },
        { stepName: 'Activation', stepIndicator: 2, isActive: false },
    ]

    return (
        <div className={css.container}>
            <div className={css.title}>
                <img src={Icon} alt="Ai-icon" />
                <div className={css.badge}>
                    <span>AI Journey Performance</span>
                </div>
            </div>
            <div className={css.content}>
                <span>
                    AI Journey automatically creates and sends personalized SMS
                    messages to shoppers who abandon their cart. No need for
                    templates — Gorgias handles everything, from syncing
                    opted-in subscribers from your platforms to personalizing
                    and delivering each message.
                </span>
                <div style={{ marginTop: '32px' }}>
                    <OnboardingStepSelector steps={steps} />
                </div>
            </div>
        </div>
    )
}
