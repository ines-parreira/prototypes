import { useRef } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'
import classNamesBind from 'classnames/bind'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import type {
    Meta as MetaType,
    Source as SourceType,
    TicketMessage as TicketMessage_DEPRECATED,
} from 'models/ticket/types'
import { AgentLabel, CustomerLabel } from 'pages/common/utils/labels'
import Meta from 'pages/tickets/detail/components/TicketMessages/Meta'
import Source from 'pages/tickets/detail/components/TicketMessages/Source'
import SourceActionsHeader from 'pages/tickets/detail/components/TicketMessages/SourceActionsHeader'
import { isForwardedMessage } from 'tickets/common/utils'
import { MessageMetadata } from 'tickets/ticket-detail/components/MessageMetadata'
import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'

import css from './MessageHeader.less'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage_DEPRECATED | TicketMessage
    isFailed?: boolean
    isMessageHidden?: boolean
    isMessageDeleted?: boolean
    isAI?: boolean
    readonly?: boolean
}

export function MessageHeader({
    message,
    isFailed,
    isMessageHidden,
    isMessageDeleted,
    isAI = false,
    readonly = false,
}: Props) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)

    const { containerRef } = useTicketModalContext()
    const sender = fromJS(message.sender || {}) as Map<any, any>
    const isForwarded = isForwardedMessage(message)
    const actionsContainerRef = useRef<HTMLDivElement>(null)

    let metaContent = (
        <Meta
            messageId={message.message_id ?? undefined}
            externalId={message.external_id}
            meta={message.meta as MetaType}
            via={message.via}
            source={message.source as SourceType}
            integrationId={message.integration_id}
            ruleId={message.rule_id?.toString()}
            messageCreatedDatetime={message.created_datetime}
        />
    )

    let isDuplicated = false
    if (
        message.meta &&
        (message.meta as Record<string, unknown>).is_duplicated
    ) {
        isDuplicated = true
    }

    if (isMessageDeleted) {
        metaContent = (
            <span className={classnames(css.deletedMessage, 'ml-1')}>
                {' '}
                Comment deleted on Facebook
            </span>
        )
    } else if (isMessageHidden && !isDuplicated) {
        metaContent = (
            <span className={classnames(css.hiddenMessage, 'ml-1')}>
                {' '}
                Message hidden
            </span>
        )
    }

    return (
        <div
            className={classNames(css.header, {
                failed: isFailed,
            })}
        >
            <div className={css.headerDetails}>
                <div
                    className={classNames(css.author, {
                        isAgent: message.from_agent,
                        hiddenMessage: isMessageHidden && !isDuplicated,
                        deletedMessage: isMessageDeleted,
                    })}
                >
                    {message.from_agent ? (
                        <AgentLabel
                            name={sender.get('name')}
                            isAIAgent={isAI}
                            className={css.agentIcon}
                        />
                    ) : (
                        <CustomerLabel customer={sender} />
                    )}
                </div>

                {message.source && (
                    <Source
                        isForwarded={isForwarded}
                        createdDatetime={message.created_datetime}
                        channel={message.channel}
                        source={message.source as SourceType}
                        containerRef={containerRef ?? undefined}
                        meta={message.meta as MetaType}
                    />
                )}
                {metaContent}
                {hasTicketThreadRevamp && (
                    <MessageMetadata message={message as TicketMessage} />
                )}
            </div>
            <div className={css.rightWrapper} ref={actionsContainerRef}>
                {!readonly && (
                    <SourceActionsHeader
                        message={message as TicketMessage_DEPRECATED}
                        containerRef={actionsContainerRef}
                    />
                )}
                {!hasTicketThreadRevamp && (
                    <MessageMetadata message={message as TicketMessage} />
                )}
            </div>
        </div>
    )
}
