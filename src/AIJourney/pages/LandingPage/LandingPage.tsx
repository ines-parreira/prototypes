import { useHistory, useParams } from 'react-router-dom'

import { Button, PerformanceBadge } from 'AIJourney/components'

import css from './LandingPage.less'

export const LandingPage = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()

    return (
        <div className={css.container}>
            <PerformanceBadge />
            <div className={css.content}>
                <span>
                    AI Journey automatically creates and sends personalized SMS
                    messages to shoppers who abandon their cart. No need for
                    templates — Gorgias handles everything, from syncing
                    opted-in subscribers from your platforms to personalizing
                    and delivering each message.
                </span>
                <Button
                    label="Continue"
                    onClick={() =>
                        history.push(
                            `/app/ai-journey/${shopName}/conversation-setup`,
                        )
                    }
                />
            </div>
        </div>
    )
}
