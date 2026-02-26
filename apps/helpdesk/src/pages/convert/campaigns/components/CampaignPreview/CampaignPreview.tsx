import classnames from 'classnames'

import type {
    GorgiasChatAvatarSettings,
    GorgiasChatLauncherType,
    GorgiasChatPosition,
} from 'models/integration/types'
import type { CampaignFormExtra } from 'pages/convert/campaigns/types/CampaignAttachment'
import type { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import type { CaptureFormDisclaimerSettings } from 'pages/convert/settings/types'
import CustomizedChatLauncher from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/CustomizedChatLauncher'

import type { CampaignProduct } from '../../types/CampaignProduct'
import { ChatCampaign } from './components/ChatCampaign'

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
    contactCaptureForm?: CampaignFormExtra
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
    shouldHideReplyInput?: boolean
    shouldHideRepositionImage?: boolean
    onCampaignContentChange?: (value: boolean) => void
    emailDisclaimerSettings?: CaptureFormDisclaimerSettings
    defaultLanguage?: string
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
    contactCaptureForm,
    shouldHideReplyInput,
    shouldHideRepositionImage,
    onCampaignContentChange,
    emailDisclaimerSettings,
    defaultLanguage,
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
            contactCaptureForm={contactCaptureForm}
            shouldHideReplyInput={shouldHideReplyInput}
            shouldHideRepositionImage={shouldHideRepositionImage}
            translatedTexts={translatedTexts}
            onCampaignContentChange={onCampaignContentChange}
            emailDisclaimerSettings={emailDisclaimerSettings}
            defaultLanguage={defaultLanguage}
        />
    </CustomizedChatLauncher>
)

export default CampaignPreview
