import Icon from 'AIJourney/assets/AI-intro-icon.svg'

import css from './LandingPage.less'

export const LandingPage = () => {
    return (
        <div className={css.container}>
            <div className={css.title}>
                <img src={Icon} alt="Ai-icon" />
                <div className={css.badge}>
                    <span>AI Journey Performance</span>
                </div>
            </div>
            <span>
                AI Journey automatically creates and sends personalized SMS
                messages to shoppers who abandon their cart. No need for
                templates — Gorgias handles everything, from syncing opted-in
                subscribers from your platforms to personalizing and delivering
                each message.
            </span>
        </div>
    )
}
