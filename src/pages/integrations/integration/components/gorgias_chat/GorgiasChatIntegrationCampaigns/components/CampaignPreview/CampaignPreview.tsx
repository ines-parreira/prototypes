import React from 'react'

import {
    GorgiasChatLauncherType,
    GorgiasChatAvatarSettings,
    GorgiasChatPosition,
} from 'models/integration/types'

import CustomizedChatLauncher from '../../../GorgiasChatIntegrationPreview/CustomizedChatLauncher'

import {CampaignProduct} from '../../types/CampaignProduct'

import {ChatCampaign} from './components/ChatCampaign'

import css from './CampaignPreview.less'

type Props = {
    html: string
    authorName?: string
    authorAvatarUrl?: string
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    mainColor?: string
    mainFontFamily: string
    translatedTexts: Record<string, string>
    position: GorgiasChatPosition
    products?: CampaignProduct[]
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
}

const CampaignPreview = ({
    html,
    authorName,
    authorAvatarUrl,
    avatar,
    chatTitle,
    mainColor,
    mainFontFamily,
    translatedTexts,
    position,
    products = [],
    launcher,
}: Props) => (
    <CustomizedChatLauncher
        className={css.preview}
        position={position}
        mainColor={mainColor}
        launcher={launcher}
        mainFontFamily={mainFontFamily}
    >
        <ChatCampaign
            authorAvatarUrl={authorAvatarUrl}
            authorName={authorName}
            avatar={avatar}
            chatTitle={chatTitle}
            html={html}
            products={products}
            translatedTexts={translatedTexts}
        />
    </CustomizedChatLauncher>
)

export default CampaignPreview
