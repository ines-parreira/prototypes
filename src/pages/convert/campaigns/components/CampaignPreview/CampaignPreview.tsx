import React from 'react'
import classnames from 'classnames'

import {
    GorgiasChatLauncherType,
    GorgiasChatAvatarSettings,
    GorgiasChatPosition,
} from 'models/integration/types'

import CustomizedChatLauncher from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/CustomizedChatLauncher'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import {CampaignProduct} from '../../types/CampaignProduct'
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
    discountOffers?: CampaignDiscountOffer[]
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
    discountOffers = [],
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
            mainColor={mainColor}
            products={products}
            discountOffers={discountOffers}
            shouldHideReplyInput={shouldHideReplyInput}
            translatedTexts={translatedTexts}
            onCampaignContentChange={onCampaignContentChange}
        />
    </CustomizedChatLauncher>
)

export default CampaignPreview
