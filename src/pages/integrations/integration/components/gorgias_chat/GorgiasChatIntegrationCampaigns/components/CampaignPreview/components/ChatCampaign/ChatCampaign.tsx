import React from 'react'

import Avatar from 'pages/common/components/Avatar/Avatar'
import GorgiasChatPoweredBy from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/GorgiasChatPoweredBy'

import css from './ChatCampaign.less'

type Props = {
    authorAvatarUrl?: string
    authorName?: string
    html: string
    translatedTexts: Record<string, string>
}

export const ChatCampaign = ({
    authorAvatarUrl,
    authorName,
    html,
    translatedTexts,
}: Props) => {
    return (
        <div className={css.campaign}>
            <div className={css.header}>
                <div className={css.author}>
                    <Avatar
                        key={authorAvatarUrl}
                        className={css.authorAvatar}
                        name={authorName || 'Random agent'}
                        url={authorAvatarUrl}
                    />
                </div>
                <div className={css.message}>
                    <div className={css.authorName}>
                        <b>{authorName || "[Random agent's name]"}</b>
                    </div>
                    <div
                        className={css.messageText}
                        dangerouslySetInnerHTML={{__html: html}}
                    />
                </div>
            </div>

            <GorgiasChatPoweredBy translatedTexts={translatedTexts} />

            <div className={css.footer}>
                {translatedTexts.campaignClickToReply}
            </div>
        </div>
    )
}
