// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
import styled from '@emotion/styled'

import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import Card from 'gorgias-design-system/Cards/Card'
import Conversation from 'gorgias-design-system/HomepageModules/Conversation/Conversation'
import ChatMessageInput from 'gorgias-design-system/Input/ChatMessageInput'
import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'

import ConversationAvatars from './ConversationAvatars'
import { AddIcon, BoxIcon, ChevronRightIcon, PlaneIcon } from './icon-utils'
import PrivacyPolicyDisclaimer from './PrivacyPolicyDisclaimer'

import css from './ChatHomePreview.less'

const StyledCard = styled(Card)`
    padding: 8px 16px 8px 8px;
`

type Props = {
    avatar?: GorgiasChatAvatarSettings
    title: string
    renderConversation: boolean
    selfServiceConfiguration: SelfServiceConfiguration | null
    language?: string
    variant?: 'collapsed' | 'expanded'
    renderPrivacyPolicyDisclaimer?: boolean
    privacyPolicyDisclaimerText?: string
}

const ChatHomePreview: React.FC<Props> = ({
    avatar,
    title,
    renderConversation = false,
    renderPrivacyPolicyDisclaimer = false,
    language,
    selfServiceConfiguration,
    variant = 'collapsed',
    privacyPolicyDisclaimerText = '',
}) => {
    const canTrackOrders = selfServiceConfiguration?.trackOrderPolicy?.enabled
    const canManageOrders =
        canTrackOrders ||
        selfServiceConfiguration?.reportIssuePolicy?.enabled ||
        selfServiceConfiguration?.cancelOrderPolicy?.enabled ||
        selfServiceConfiguration?.returnOrderPolicy?.enabled

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]
    const translatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    const ExpandedConversation = () => {
        if (!renderConversation) return null
        return (
            <Conversation
                avatar={
                    <ConversationAvatars avatar={avatar} chatTitle={title} />
                }
                footer={
                    <>
                        {renderPrivacyPolicyDisclaimer && (
                            <PrivacyPolicyDisclaimer
                                mainColor="#FFFFFF"
                                privacyPolicyDisclaimerText={
                                    privacyPolicyDisclaimerText
                                }
                                variant="expanded"
                            />
                        )}

                        <ChatMessageInput
                            aria-label={'Gorgias message input'}
                            placeholder={translatedTexts.inputPlaceholder}
                            leadIcon={<AddIcon />}
                            leadIconAriaLabel="Add attachment"
                            trailIcon={<PlaneIcon />}
                            trailIconAriaLabel="Send message"
                            readOnly
                            style={{ marginTop: '16px', maxHeight: '45px' }}
                        />
                    </>
                }
                title={title}
                variant="expanded"
            />
        )
    }

    const CollapsedConversation = () => {
        if (!renderConversation) return null
        return (
            <Conversation
                avatar={
                    <ConversationAvatars avatar={avatar} chatTitle={title} />
                }
                trailIcon={<PlaneIcon />}
                title={title}
                description={sspTexts.sendUsAMessage}
                variant="collapsed"
            />
        )
    }

    return (
        <div className={css.contentContainer}>
            {canManageOrders && (
                <StyledCard
                    leadIcon={<BoxIcon />}
                    title={
                        canTrackOrders
                            ? sspTexts.trackAndManageMyOrders
                            : sspTexts.manageMyOrders
                    }
                    trailIcon={<ChevronRightIcon />}
                />
            )}
            {variant === 'expanded' ? (
                <ExpandedConversation />
            ) : (
                <CollapsedConversation />
            )}
        </div>
    )
}

export default ChatHomePreview
