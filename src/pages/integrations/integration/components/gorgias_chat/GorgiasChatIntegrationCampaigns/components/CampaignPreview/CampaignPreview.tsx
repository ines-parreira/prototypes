import React from 'react'
import classnames from 'classnames'

import {
    GorgiasChatLauncherType,
    GorgiasChatAvatarSettings,
    GorgiasChatPosition,
} from 'models/integration/types'

import {CampaignProduct} from '../../types/CampaignProduct'
import CustomizedChatLauncher from '../../../GorgiasChatIntegrationPreview/CustomizedChatLauncher'
import {ChatCampaign} from './components/ChatCampaign'
import css from './CampaignPreview.less'

type Props = {
    html: string
    authorName?: string
    authorAvatarUrl?: string
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    className?: string
    mainColor?: string
    mainFontFamily: string
    translatedTexts: Record<string, string>
    position: GorgiasChatPosition
    products?: CampaignProduct[]
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
    shouldHideReplyInput?: boolean
    onCampaignContentChange?: (value: boolean) => void
}

const CampaignPreview = ({
    html,
    authorName,
    authorAvatarUrl,
    avatar,
    chatTitle,
    className,
    mainColor,
    mainFontFamily,
    translatedTexts,
    position,
    products = [],
    shouldHideReplyInput,
    onCampaignContentChange,
}: Props) => (
    <CustomizedChatLauncher
        className={classnames(css.preview, className)}
        position={position}
        mainColor={mainColor}
        mainFontFamily={mainFontFamily}
    >
        <ChatCampaign
            authorAvatarUrl={authorAvatarUrl}
            authorName={authorName}
            avatar={avatar}
            chatTitle={chatTitle}
            html={html}
            products={products}
            shouldHideReplyInput={shouldHideReplyInput}
            translatedTexts={translatedTexts}
            onCampaignContentChange={onCampaignContentChange}
        />
    </CustomizedChatLauncher>
)

export default CampaignPreview
