import React, {useEffect} from 'react'
import ReactPlayer from 'react-player'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useMeasure from 'react-use/lib/useMeasure'

import {extractGorgiasVideoDivFromHtmlContent} from 'utils'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
} from 'models/integration/types'
import {AgentDisplayName} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/AgentDisplayName'
import ChatAvatar from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatAvatar'
import {FeatureFlagKey} from 'config/featureFlags'

import {CAMPAIGN_MAX_HEIGHT} from '../../../../constants/visuals'
import {CampaignProduct} from '../../../../types/CampaignProduct'

import {ProductCarousel} from '../ProductCarousel'

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

    return (
        <>
            [Random agent's first name
            {avatar?.nameType ===
                GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL &&
                ', last name initials'}
            ]
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
    shouldHideReplyInput?: boolean
    translatedTexts: Record<string, string>
    onCampaignContentChange?: (value: boolean) => void
}

export const ChatCampaign = ({
    authorAvatarUrl,
    authorName,
    avatar,
    chatTitle,
    html,
    mainColor,
    products = [],
    shouldHideReplyInput = false,
    translatedTexts,
    onCampaignContentChange,
}: Props) => {
    const [measureRef, {height}] = useMeasure<HTMLDivElement>()
    const isAgentAvatarCustomizationEnabled =
        useFlags()[FeatureFlagKey.ChatAgentAvatarCustomization]

    const {videoUrls, htmlCleaned} = extractGorgiasVideoDivFromHtmlContent(html)

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
                                    isAgentAvatarCustomizationEnabled &&
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
                                size={50}
                            />
                            <div className={css.authorName}>
                                <b>
                                    {isAgentAvatarCustomizationEnabled ? (
                                        <AuthorName
                                            authorName={authorName}
                                            avatar={avatar}
                                            chatTitle={chatTitle}
                                            isAuthorSelected={isAuthorSelected}
                                        />
                                    ) : (
                                        authorName || "[Random agent's name]"
                                    )}
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
            {products.length > 0 && (
                <div className={css.carouselContainer}>
                    <ProductCarousel
                        products={products}
                        mainColor={mainColor}
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
