import { ReactNode } from 'react'

import classnames from 'classnames'
import classNamesBind from 'classnames/bind'
import { fromJS, Map } from 'immutable'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import {
    Meta as MetaType,
    Source as SourceType,
    TicketMessage as TicketMessage_DEPRECATED,
} from 'models/ticket/types'
import { AgentLabel, CustomerLabel } from 'pages/common/utils/labels'
import { isForwardedMessage } from 'tickets/common/utils'

import Meta from './Meta'
import Source from './Source'

import css from './Header.less'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string
    message: TicketMessage_DEPRECATED | TicketMessage
    hasError?: boolean
    isMessageHidden?: boolean
    isMessageDeleted?: boolean
    isMessageFromAIAgent?: boolean
    sourceDetails?: ReactNode
    containerRef?: React.RefObject<HTMLDivElement>
}

export default function Header({
    id,
    message,
    hasError,
    isMessageHidden,
    isMessageDeleted,
    isMessageFromAIAgent = false,
    sourceDetails = null,
    containerRef,
}: Props) {
    const sender = fromJS(message.sender || {}) as Map<any, any>
    const isForwarded = isForwardedMessage(message)
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
                hasError: hasError,
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
                            isAIAgent={isMessageFromAIAgent}
                            className={css.agentIcon}
                        />
                    ) : (
                        <CustomerLabel customer={sender} />
                    )}
                </div>

                {message.source && (
                    <Source
                        id={id}
                        isForwarded={isForwarded}
                        createdDatetime={message.created_datetime}
                        channel={message.channel}
                        source={message.source as SourceType}
                        containerRef={containerRef}
                    />
                )}
                {metaContent}
            </div>
            {sourceDetails}
        </div>
    )
}
