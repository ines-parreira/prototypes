import React from 'react'
import classnames from 'classnames'

import {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'

import {PreviewToolbar} from './components/PreviewToolbar'
import {ChatCampaign} from './components/ChatCampaign'
import {ChatBubble} from './components/ChatBubble'

import css from './CampaignPreview.less'

type Props = {
    html: string
    authorName?: string
    authorAvatarUrl?: string
    mainColor?: string
    translatedTexts: Record<string, string>
    position: GorgiasChatPosition
}

const CampaignPreview = ({
    html,
    authorName,
    authorAvatarUrl,
    mainColor,
    translatedTexts,
    position,
}: Props) => {
    const isButtonOnTop =
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_LEFT

    const previewContainerClassNames = classnames({
        [css.container]: true,
        [css.bubbleOnTop]: isButtonOnTop,
    })

    return (
        <div className={css.preview}>
            <PreviewToolbar />
            <div className={previewContainerClassNames}>
                <ChatCampaign
                    authorAvatarUrl={authorAvatarUrl}
                    authorName={authorName}
                    html={html}
                    translatedTexts={translatedTexts}
                />
                <ChatBubble alignment={position.alignment} color={mainColor} />
            </div>
        </div>
    )
}

export default CampaignPreview
