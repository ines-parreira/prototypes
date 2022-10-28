import React, {Component, ReactNode} from 'react'
import _memoize from 'lodash/memoize'
import classNamesBind from 'classnames/bind'
import moment, {Moment} from 'moment'
import {fromJS, Map} from 'immutable'

import colorTokens from 'assets/tokens/colors.json'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {getDisplayCustomerLastSeenOnChat} from 'pages/common/components/infobar/utils'
import {scrollToReactNode} from 'pages/common/utils/keyboard'
import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationType} from 'models/integration/constants'
import {isFailed, isPending} from 'models/ticket/predicates'
import {TicketMessage} from 'models/ticket/types'
import {getLDClient} from 'utils/launchDarkly'
import css from './Container.less'
import Header from './Header'
import Footer from './Footer'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string
    className?: string
    message: TicketMessage
    hasCursor: boolean
    lastMessageDatetimeAfterMount: Moment | null
    children?: ReactNode
    timezone: string
    isLastRead: boolean
    containsLastCustomerMessage: boolean
    displayMessageStatusIndicator?: boolean
    isMessageHidden: boolean
    isMessageDeleted: boolean
    isBodyHighlighted: boolean
    customer: Map<any, any>
    lastCustomerMessageDateTime?: string
}

export default class Container extends Component<Props> {
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
        // TODO: refactor after Virtualization is rolled out
        const isVirtualizationEnabled =
            getLDClient().allFlags()[
                FeatureFlagKey.TicketMessagesVirtualization
            ]

        const {
            children,
            message,
            isMessageHidden,
            isMessageDeleted,
            customer,
            timezone,
            containsLastCustomerMessage,
            displayMessageStatusIndicator = false,
        } = this.props

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

            if (
                customer &&
                !customer.isEmpty() &&
                containsLastCustomerMessage
            ) {
                badgeBorderColor =
                    colorTokens['📺 Classic'].Neutral.Grey_0.value

                const memoizedCustomerIntegrationsData = _memoize(
                    (customer: Map<any, any>): Map<any, any> =>
                        customer.get('integrations') as Map<any, any>
                )

                const customerIntegrationsData =
                    memoizedCustomerIntegrationsData(customer)

                let chatIntegrationData: Map<any, any> | null = null
                if (customerIntegrationsData) {
                    chatIntegrationData = customerIntegrationsData.find(
                        (customerIntegrationData: Map<any, any>) =>
                            customerIntegrationData.get(
                                '__integration_type__'
                            ) === IntegrationType.GorgiasChat
                    )
                }

                if (chatIntegrationData) {
                    lastSeenOnChat = chatIntegrationData.get(
                        'chat_recent_activity_timestamp'
                    )
                }

                if (lastSeenOnChat) {
                    timeReadableValue = getDisplayCustomerLastSeenOnChat(
                        lastSeenOnChat,
                        timezone
                    )

                    badgeColor =
                        timeReadableValue === 'now'
                            ? colorTokens['📺 Classic'].Feedback.Success.value
                            : colorTokens['📺 Classic'].Neutral.Grey_4.value

                    tooltipText =
                        timeReadableValue === 'now'
                            ? `Active ${timeReadableValue}`
                            : `Last seen: ${timeReadableValue}`
                }
            }

            avatar = (
                <div className={css.avatar}>
                    <Avatar
                        email={message.from_agent ? null : sender.get('email')}
                        name={sender.get('name')}
                        url={sender.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                        badgeColor={badgeColor}
                        badgeBorderColor={badgeBorderColor}
                        withTooltip={!!timeReadableValue}
                        tooltipText={tooltipText}
                    />
                </div>
            )
        }

        // appear animation if message is created after the ticket body component is mounted
        const {lastMessageDatetimeAfterMount} = this.props
        const appear =
            !!lastMessageDatetimeAfterMount &&
            !message.from_agent &&
            moment(message.created_datetime).diff(
                lastMessageDatetimeAfterMount
            ) > 0

        return (
            <div
                className={classNames(
                    'ticket-message',
                    this.props.className,
                    css.component,
                    {
                        internal: !message.public,
                        appear: appear,
                        hasError: isFailed(message),
                        'ticket-message-loading': isPending(message),
                        ticketMessagesHighlighted: this.props.isBodyHighlighted,
                        isVirtualized: isVirtualizationEnabled,
                    }
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
                        isLastRead={this.props.isLastRead}
                        displayMessageStatusIndicator={
                            displayMessageStatusIndicator
                        }
                        timezone={this.props.timezone}
                        hasError={isFailed(message)}
                        isMessageHidden={isMessageHidden}
                        isMessageDeleted={isMessageDeleted}
                    />
                    {children}
                    <Footer
                        id={this.props.id}
                        message={message}
                        isMessageHidden={isMessageHidden}
                        isMessageDeleted={isMessageDeleted}
                    />
                </div>
            </div>
        )
    }
}
