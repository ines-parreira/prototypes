import React from 'react'

import { Avatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'

import css from './PlaygroundInitialContent.less'

export const PlaygroundInitialContent = () => {
    return (
        <div className={css.container}>
            <div className={css.avatarContainer}>
                <Avatar isAIAgent={true} isAgent={true} name="AI Agent" />
            </div>
            <div>
                <h2 className={css.title}>Preview customer experience</h2>
                <h3 className={css.subtitle}>
                    Ask questions like a customer would and see exactly how AI
                    Agent responds. Use this to fine-tune knowledge, tone, and
                    accuracy.
                </h3>
            </div>
        </div>
    )
}
