import React from 'react'

import { Avatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'

import css from './PlaygroundInitialContent.less'

export const PlaygroundInitialContent = () => {
    return (
        <div className={css.container}>
            <div className={css.avatarContainer}>
                <Avatar isAIAgent={true} isAgent={true} name="AI Agent" />
            </div>
            <h2 className={css.title}>
                Ask AI Agent a question your customers may ask
            </h2>
            <p className={css.subtitle}>
                AI Agent will use your knowledge and order history to respond
            </p>
            <p className={css.footer}>
                Knowledge must be enabled in order to test
            </p>
        </div>
    )
}
