import type React from 'react'
import { useEffect, useState } from 'react'

import { useMeasure } from '@repo/hooks'
import classNames from 'classnames'
import ReactPlayer from 'react-player'

import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import { ProductCarousel } from 'pages/common/components/ProductCarousel'
import { CAMPAIGN_MAX_HEIGHT } from 'pages/convert/campaigns/constants/visuals'
import type { CampaignFormExtra } from 'pages/convert/campaigns/types/CampaignAttachment'
import type { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import type { CampaignProduct } from 'pages/convert/campaigns/types/CampaignProduct'
import type { CaptureFormDisclaimerSettings } from 'pages/convert/settings/types'
import { AgentDisplayName } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/AgentDisplayName'
import ChatAvatar from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatAvatar'
import { extractGorgiasVideoDivFromHtmlContent } from 'utils'

import { ContactCaptureFormPreview } from '../ContactCaptureFormPreview/ContactCaptureFormPreview'
import { DiscountOfferPreview } from '../DiscountOfferPreview/DiscountOfferPreview'

import css from './ChatCampaign.less'

type AuthorNameProps = {
    authorName?: string
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    isAuthorSelected: boolean
}

const AuthorName: React.FC<AuthorNameProps> = ({
    authorName,
    avatar,
    chatTitle,
    isAuthorSelected,
}) => {
    if (isAuthorSelected) {
        return (
            <AgentDisplayName
                name={authorName!}
                type={
                    isAuthorSelected &&
                    avatar?.nameType === GorgiasChatAvatarNameType.CHAT_TITLE
                        ? GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                        : avatar?.nameType
                }
            />
        )
    }

    if (avatar?.nameType === GorgiasChatAvatarNameType.CHAT_TITLE) {
        return <>{chatTitle}</>
    }

    /* istanbul ignore next */
    return (
        <>
            {`[Random agent's first name${
                /* istanbul ignore next */
                avatar?.nameType ===
                GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL
                    ? ', last name initials'
                    : ''
            }]`}
        </>
    )
}

type Props = {
    authorAvatarUrl?: string
    authorName?: string
    avatar?: GorgiasChatAvatarSettings
    chatTitle?: string
    html: string
    mainColor?: string
    products?: CampaignProduct[]
    discountOffers?: CampaignDiscountOffer[]
    contactCaptureForm?: CampaignFormExtra
    shouldHideReplyInput?: boolean
    shouldHideRepositionImage?: boolean
    translatedTexts: Record<string, string>
    onCampaignContentChange?: (value: boolean) => void
    emailDisclaimerSettings?: CaptureFormDisclaimerSettings
    defaultLanguage?: string
}

export const ChatCampaign = ({
    authorAvatarUrl,
    authorName,
    avatar,
    chatTitle,
    html,
    mainColor,
    products = [],
    discountOffers = [],
    contactCaptureForm,
    shouldHideReplyInput = false,
    shouldHideRepositionImage = false,
    translatedTexts,
    onCampaignContentChange,
    emailDisclaimerSettings,
    defaultLanguage,
}: Props) => {
    const [measureRef, { height }] = useMeasure<HTMLDivElement>()

    const [newMessage, setNewMessage] = useState<string>()

    const { videoUrls, htmlCleaned } = extractGorgiasVideoDivFromHtmlContent(
        newMessage || html,
    )

    const isAuthorSelected = !!authorName

    useEffect(() => {
        if (!onCampaignContentChange) {
            return
        }

        if (height > CAMPAIGN_MAX_HEIGHT) {
            onCampaignContentChange(true)
        } else {
            onCampaignContentChange(false)
        }
    }, [onCampaignContentChange, height])

    return (
        <div ref={measureRef} className={css.campaign}>
            <div className={css.content}>
                <div className={css.header}>
                    <div className={css.message}>
                        <div className={css.author}>
                            <ChatAvatar
                                chatTitle={chatTitle}
                                agentName={authorName || 'Random agent'}
                                agentAvatarUrl={authorAvatarUrl}
                                avatar={avatar}
                                showPlaceholderAvatar={
                                    avatar?.imageType ===
                                        GorgiasChatAvatarImageType.AGENT_PICTURE &&
                                    !isAuthorSelected
                                }
                                forceNameType={
                                    isAuthorSelected &&
                                    avatar?.nameType ===
                                        GorgiasChatAvatarNameType.CHAT_TITLE
                                        ? GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                                        : undefined
                                }
                                size={32}
                            />
                            <div className={css.authorName}>
                                <b>
                                    <AuthorName
                                        authorName={authorName}
                                        avatar={avatar}
                                        chatTitle={chatTitle}
                                        isAuthorSelected={isAuthorSelected}
                                    />
                                </b>
                            </div>
                        </div>
                        <div
                            className={css.messageText}
                            dangerouslySetInnerHTML={{
                                __html: htmlCleaned,
                            }}
                        />
                    </div>
                </div>
            </div>
            {videoUrls.length > 0 && (
                <div className={css.videos}>
                    {videoUrls.map((url, idx) => (
                        <div key={idx} className={css.video}>
                            <ReactPlayer
                                url={url}
                                controls={true}
                                light={false}
                                width="100%"
                                height="100%"
                            />
                        </div>
                    ))}
                </div>
            )}
            {discountOffers.length > 0 && (
                <DiscountOfferPreview
                    offer={discountOffers[0]}
                    mainColor={mainColor}
                />
            )}
            {contactCaptureForm && (
                <ContactCaptureFormPreview
                    form={contactCaptureForm}
                    onMessageHtmlChange={setNewMessage}
                    mainColor={mainColor}
                    emailDisclaimerSettings={emailDisclaimerSettings}
                    defaultLanguage={defaultLanguage}
                />
            )}
            {products.length > 0 && (
                <div
                    className={classNames(css.carouselContainer, {
                        [css.noReply]: shouldHideReplyInput,
                    })}
                >
                    <ProductCarousel
                        products={products}
                        mainColor={mainColor}
                        shouldHideRepositionImage={shouldHideRepositionImage}
                    />
                </div>
            )}

            {!shouldHideReplyInput && (
                <div className={css.footer}>
                    {translatedTexts.campaignClickToReply}
                </div>
            )}
        </div>
    )
}
