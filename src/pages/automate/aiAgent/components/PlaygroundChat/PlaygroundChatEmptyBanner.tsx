import React from 'react'

import {assetsUrl} from 'utils'
import css from './PlaygroundChatEmptyBanner.less'

export const PlaygroundChatEmptyBanner = () => {
    return (
        <div
            className={css.container}
            style={{
                backgroundImage: `url(${assetsUrl(
                    '/img/ai-agent/ai-banner-background.png'
                )})`,
            }}
        >
            <div className={css.title}>Test AI Agent as a customer</div>
            <div className={css.subtitle}>
                Send messages to AI Agent to see how it responds to your
                customers. You can even select a customer to see how AI Agent
                would respond to a specific person using real data.
            </div>
        </div>
    )
}
