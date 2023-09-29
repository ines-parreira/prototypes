// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
import React from 'react'

import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import List from 'gorgias-design-system/List/List'
import ListItem from 'gorgias-design-system/List/ListItem'
import Card from 'gorgias-design-system/Cards/Card'
import Conversation from 'gorgias-design-system/HomepageModules/Conversation/Conversation'
import css from './ChatHomePreview.less'
import {BoxIcon, ChevronRightIcon, PlaneIcon} from './icon-utils'
import ConversationAvatars from './ConversationAvatars'

type Props = {
    avatar?: GorgiasChatAvatarSettings
    title: string
    renderConversation: boolean
    selfServiceConfiguration: SelfServiceConfiguration | null
    language?: string
}

const ChatHomePreview: React.FC<Props> = ({
    avatar,
    title,
    renderConversation = false,
    language,
    selfServiceConfiguration,
}) => {
    const quickResponses =
        selfServiceConfiguration?.quick_response_policies.filter(
            (quickResponse) => !quickResponse.deactivated_datetime
        ) ?? []
    const canTrackOrders = selfServiceConfiguration?.track_order_policy.enabled
    const canManageOrders =
        canTrackOrders ||
        selfServiceConfiguration?.report_issue_policy.enabled ||
        selfServiceConfiguration?.cancel_order_policy.enabled ||
        selfServiceConfiguration?.return_order_policy.enabled

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]

    return (
        <div className={css.contentContainer}>
            {quickResponses.length > 0 && (
                <List style={{marginBottom: '20px'}}>
                    {quickResponses.map((quickResponse) => (
                        <ListItem
                            key={quickResponse.id}
                            label={quickResponse.title}
                            trailIcon={<ChevronRightIcon />}
                        />
                    ))}
                </List>
            )}
            {canManageOrders && (
                <Card
                    style={{marginBottom: '20px'}}
                    leadIcon={<BoxIcon />}
                    title={
                        canTrackOrders
                            ? sspTexts.trackAndManageMyOrders
                            : sspTexts.manageMyOrders
                    }
                    trailIcon={<ChevronRightIcon />}
                />
            )}
            {renderConversation && (
                <Conversation
                    avatar={
                        <ConversationAvatars
                            avatar={avatar}
                            chatTitle={title}
                        />
                    }
                    trailIcon={<PlaneIcon />}
                    title={title}
                    description={sspTexts.sendUsAMessage}
                    variant="collapsed"
                />
            )}
        </div>
    )
}

export default ChatHomePreview
