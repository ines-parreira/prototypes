import type { ReactNode } from 'react'
import { Component } from 'react'

import { FeatureFlagKey, withFeatureFlags } from '@repo/feature-flags'
import type { FeatureFlagsMap } from '@repo/feature-flags'
import classNamesBind from 'classnames/bind'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _memoize from 'lodash/memoize'
import type { Moment } from 'moment'
import moment from 'moment'

import { TicketMessageSourceType, TicketVia } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/constants'
import { isFailed, isPending } from 'models/ticket/predicates'
import type { TicketMessage } from 'models/ticket/types'
import { MessageMetadataType } from 'models/ticket/types'
import DEPRECATED_Avatar from 'pages/common/components/Avatar/Avatar'
import { getDisplayCustomerLastSeenOnChat } from 'pages/common/components/infobar/utils'
import { scrollToReactNode } from 'pages/common/utils/keyboard'
import SimplifiedAIAgentBanner from 'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { MessageHeader } from 'tickets/ticket-detail/components/MessageHeader'
import { withMessageTranslations } from 'tickets/ticket-detail/components/withMessageTranslations'

import AIAgentMessageEvents from './AIAgentMessageEvents'
import { AiAgentReasoning } from './AiAgentReasoning'
import { Avatar } from './Avatar'
import Footer from './Footer'

import css from './Container.less'

const classNames = classNamesBind.bind(css)

type Props = {
    className?: string
    ticketId: number
    message: TicketMessage
    // Ideally we only want to pass the messages but as this is a hotfix I'll only add those and not deprecate the sole message object
    // https://linear.app/gorgias/issue/AUTIN-1944/handover-close-snooze-icons-dont-appear-in-the-ticket-ui
    messages: TicketMessage[]
    hasCursor: boolean
    lastMessageDatetimeAfterMount: Moment | null
    children?: ReactNode
    timezone: string
    containsLastCustomerMessage: boolean
    isMessageHidden: boolean
    isMessageDeleted: boolean
    isBodyHighlighted: boolean
    isAIAgentInternalNote?: boolean
    isAIAgentMessage?: boolean
    isAIAgentMessageSelected?: boolean
    isTicketAfterFeedbackCollectionPeriod?: boolean
    shouldTicketHaveReasoning?: boolean | null
    allowsAIFeedback?: boolean
    customer: Map<any, any>
    lastCustomerMessageDateTime?: string
    shouldDisplayAuditLogEvents?: boolean
    flags?: FeatureFlagsMap
    isImpersonated?: boolean
}

export class Container extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
        // only if it just got the cursor.
        // to prevent focusing on the cursor item when a different one updates.
        if (this.props.hasCursor && !prevProps.hasCursor) {
            scrollToReactNode(this)
        }
        if (this.props.isBodyHighlighted && !prevProps.isBodyHighlighted) {
            scrollToReactNode(this)
        }
    }

    render() {
        const {
            children,
            message,
            messages,
            isMessageHidden,
            isMessageDeleted,
            isAIAgentInternalNote = false,
            isAIAgentMessage = false,
            isAIAgentMessageSelected = false,
            customer,
            timezone,
            containsLastCustomerMessage,
            shouldDisplayAuditLogEvents = false,
            isTicketAfterFeedbackCollectionPeriod = false,
            shouldTicketHaveReasoning = false,
            flags,
            isImpersonated,
        } = this.props

        const isInternalNote =
            message.source?.type === TicketMessageSourceType.InternalNote

        const hasTicketThreadRevamp =
            !!flags?.[FeatureFlagKey.TicketThreadRevamp]

        const showAiReasoning =
            !!flags?.[FeatureFlagKey.ShowAiReasoningInTicket]

        const onlyShowReasoningWhileImpersonating =
            !!flags?.[FeatureFlagKey.OnlyShowReasoningWhileImpersonating]

        const sender = fromJS(message.sender || {}) as Map<any, any>
        let avatar

        const isMessageDuplicated = message?.meta?.is_duplicated
        const shouldRenderAvatar =
            (!isMessageHidden && !isMessageDeleted) ||
            (isMessageHidden && isMessageDuplicated)

        if (shouldRenderAvatar) {
            let badgeColor = undefined,
                badgeBorderColor,
                timeReadableValue,
                lastSeenOnChat = null,
                tooltipText

            let status: 'offline' | 'online' | undefined = undefined

            if (
                customer &&
                !customer.isEmpty() &&
                containsLastCustomerMessage
            ) {
                badgeBorderColor = 'var(--neutral-grey-0)'
                status = 'offline'

                const memoizedCustomerIntegrationsData = _memoize(
                    (customer: Map<any, any>): Map<any, any> =>
                        customer.get('integrations') as Map<any, any>,
                )

                const customerIntegrationsData =
                    memoizedCustomerIntegrationsData(customer)

                let chatIntegrationData: Map<any, any> | null = null
                if (customerIntegrationsData) {
                    chatIntegrationData = customerIntegrationsData.find(
                        (customerIntegrationData: Map<any, any>) =>
                            customerIntegrationData.get(
                                '__integration_type__',
                            ) === IntegrationType.GorgiasChat,
                    )
                }

                if (chatIntegrationData) {
                    lastSeenOnChat = chatIntegrationData.get(
                        'chat_recent_activity_timestamp',
                    )
                }

                if (lastSeenOnChat) {
                    timeReadableValue = getDisplayCustomerLastSeenOnChat(
                        lastSeenOnChat,
                        timezone,
                    )

                    badgeColor =
                        timeReadableValue === 'now'
                            ? 'var(--feedback-success)'
                            : 'var(--neutral-grey-4)'

                    tooltipText =
                        timeReadableValue === 'now'
                            ? `Active ${timeReadableValue}`
                            : `Last seen: ${timeReadableValue}`

                    status = timeReadableValue === 'now' ? 'online' : 'offline'
                }
            }

            avatar = hasTicketThreadRevamp ? (
                <div className={css.avatar}>
                    <Avatar
                        isAgent={message.from_agent}
                        isAIAgent={isAIAgentMessage}
                        name={sender.get('name') ?? ''}
                        status={status}
                        tooltip={tooltipText}
                        url={
                            sender.getIn(['meta', 'profile_picture_url']) ??
                            undefined
                        }
                        userId={sender.get('id')}
                    />
                </div>
            ) : (
                <div className={css.avatar}>
                    <DEPRECATED_Avatar
                        email={message.from_agent ? null : sender.get('email')}
                        name={sender.get('name')}
                        url={sender.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                        badgeColor={badgeColor}
                        badgeBorderColor={badgeBorderColor}
                        withTooltip={!!timeReadableValue}
                        tooltipText={tooltipText}
                        isAIAgent={isAIAgentMessage}
                    />
                </div>
            )
        }

        // appear animation if message is created after the ticket body component is mounted
        const { lastMessageDatetimeAfterMount } = this.props
        const appear =
            !!lastMessageDatetimeAfterMount &&
            !message.from_agent &&
            moment(message.created_datetime).diff(
                lastMessageDatetimeAfterMount,
            ) > 0

        const showAIAgentMessageEvents =
            isAIAgentMessage && !shouldDisplayAuditLogEvents

        const lastAIAgentMessage = messages
            .slice()
            .reverse()
            .find(
                (message) =>
                    message.via === TicketVia.Api &&
                    AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS.includes(
                        message.sender.email,
                    ),
            )

        // Used to transfer metadata from chat without displaying a message
        const isSignal = message.meta?.type === MessageMetadataType.Signal

        return (
            <>
                {!isSignal && (
                    <div
                        data-testid={`ticket-message-${this.props.message.id}`}
                        className={classNames(
                            'ticket-message',
                            this.props.className,
                            css.component,
                            {
                                internal: !isAIAgentMessage && !message.public,
                                appear: appear,
                                hasError: isFailed(message),
                                'ticket-message-loading': isPending(message),
                                ticketMessagesHighlighted:
                                    this.props.isBodyHighlighted,
                                ticketHandledByAIAgent: isAIAgentMessage,
                                aiMessageSelected: isAIAgentMessageSelected,
                            },
                        )}
                    >
                        {avatar}
                        <div
                            className={classNames(css.bodyWrapper, {
                                bodyWrapperForHiddenOrDeletedMessage:
                                    (isMessageHidden && !isMessageDuplicated) ||
                                    isMessageDeleted,
                            })}
                        >
                            <MessageHeader
                                message={message}
                                isFailed={isFailed(message)}
                                isMessageHidden={isMessageHidden}
                                isMessageDeleted={isMessageDeleted}
                                isAI={isAIAgentMessage}
                            />
                            {!isAIAgentInternalNote && children}
                            {isAIAgentMessage &&
                                shouldTicketHaveReasoning !== null &&
                                (isTicketAfterFeedbackCollectionPeriod ? (
                                    showAiReasoning &&
                                    message.id &&
                                    !isInternalNote &&
                                    message.via === TicketVia.Api &&
                                    shouldTicketHaveReasoning &&
                                    (isImpersonated ||
                                        !onlyShowReasoningWhileImpersonating) ? (
                                        <AiAgentReasoning message={message} />
                                    ) : (
                                        <SimplifiedAIAgentBanner
                                            message={message}
                                            messages={messages}
                                        />
                                    )
                                ) : (
                                    <SimplifiedAIAgentBanner
                                        message={message}
                                        messages={messages}
                                    />
                                ))}

                            <Footer
                                message={message}
                                isMessageHidden={isMessageHidden}
                                isMessageDeleted={isMessageDeleted}
                            />
                        </div>
                    </div>
                )}
                {showAIAgentMessageEvents && lastAIAgentMessage && (
                    <AIAgentMessageEvents
                        data-testid="ai-agent-message-events"
                        message={lastAIAgentMessage}
                    />
                )}
            </>
        )
    }
}

export default withFeatureFlags(withMessageTranslations(Container))
