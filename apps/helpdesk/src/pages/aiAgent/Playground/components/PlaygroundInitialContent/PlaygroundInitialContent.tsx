import React from 'react'

import aiAgentAvatarSrc from 'assets/img/ai-agent/ai-agent-avatar.png'
import Avatar from 'pages/common/components/Avatar/Avatar'

import css from './PlaygroundInitialContent.less'

export const PlaygroundInitialContent = () => {
    return (
        <div className={css.container}>
            <div className={css.avatarContainer}>
                <Avatar size={48} url={aiAgentAvatarSrc} shape="round" />
            </div>
            <h2 className={css.title}>
                Ask AI Agent a question your customers may ask
            </h2>
            <p className={css.subtitle}>
                AI Agent will use your store&apos;s resources and order history
                to respond
            </p>
            <p className={css.footer}>
                Test conversations won&apos;t send messages or take any real
                actions.
            </p>
        </div>
    )
}
