import { useHistory, useParams } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import Icon from 'AIJourney/assets/AI-intro-icon.svg'

import css from './LandingPage.less'

export const LandingPage = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()

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
                <div style={{ marginTop: '32px', alignSelf: 'center' }}>
                    <Button
                        onClick={() =>
                            history.push(
                                `/app/ai-journey/${shopName}/conversation-setup`,
                            )
                        }
                    >
                        This is a placeholder button
                    </Button>
                </div>
            </div>
        </div>
    )
}
