import { Component, ReactNode } from 'react'

import classNamesBind from 'classnames/bind'
import { fromJS, Map } from 'immutable'
import { LDFlagSet } from 'launchdarkly-js-client-sdk'
import { withLDConsumer } from 'launchdarkly-react-client-sdk'
import _memoize from 'lodash/memoize'
import moment, { Moment } from 'moment'

import { TicketVia } from 'business/types/ticket'
import { FeatureFlagKey } from 'config/featureFlags'
import { IntegrationType } from 'models/integration/constants'
import { isFailed, isPending } from 'models/ticket/predicates'
import { MessageMetadataType, TicketMessage } from 'models/ticket/types'
import DEPRECATED_Avatar from 'pages/common/components/Avatar/Avatar'
import { getDisplayCustomerLastSeenOnChat } from 'pages/common/components/infobar/utils'
import { scrollToReactNode } from 'pages/common/utils/keyboard'
import SimplifiedAIAgentBanner from 'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'

import AIAgentBanner from './AIAgentBanner'
import AIAgentMessageEvents from './AIAgentMessageEvents'
import { Avatar } from './Avatar'
import Footer from './Footer'
import Header from './Header'
import SourceDetailsHeader from './SourceDetailsHeader'

import css from './Container.less'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string
    className?: string
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
    allowsAIFeedback?: boolean
    customer: Map<any, any>
    lastCustomerMessageDateTime?: string
    shouldDisplayAuditLogEvents?: boolean
    flags?: LDFlagSet
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
            flags,
        } = this.props

        const hasTicketThreadRevamp =
            !!flags?.[FeatureFlagKey.TicketThreadRevamp]

        const isSimplifiedFeedbackCollectionEnabled =
            !!flags?.[FeatureFlagKey.SimplifyAiAgentFeedbackCollection] &&
            isTicketAfterFeedbackCollectionPeriod

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
                            <Header
                                id={this.props.id}
                                message={message}
                                hasError={isFailed(message)}
                                isMessageHidden={isMessageHidden}
                                isMessageDeleted={isMessageDeleted}
                                isMessageFromAIAgent={isAIAgentMessage}
                                sourceDetails={
                                    <SourceDetailsHeader
                                        className={css.sourceDetails}
                                        message={message}
                                        isMessageDeleted={isMessageDeleted}
                                    />
                                }
                            />
                            {!isAIAgentInternalNote && children}
                            {isAIAgentMessage &&
                                (isSimplifiedFeedbackCollectionEnabled ? (
                                    <SimplifiedAIAgentBanner
                                        message={message}
                                        messages={messages}
                                    />
                                ) : (
                                    <AIAgentBanner
                                        message={message}
                                        messages={messages}
                                        className={classNames({
                                            [css.withVerticalSpacing]:
                                                !isAIAgentInternalNote,
                                        })}
                                    />
                                ))}

                            <Footer
                                id={this.props.id}
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

export default withLDConsumer()(Container)
