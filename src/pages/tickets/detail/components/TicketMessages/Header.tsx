import classNamesBind from 'classnames/bind'
import {fromJS, Map} from 'immutable'
import React from 'react'
import classnames from 'classnames'

import {TicketMessage} from '../../../../../models/ticket/types'
import {isForwardedMessage} from '../../../../../state/ticket/utils'
import {AgentLabel, CustomerLabel} from '../../../../common/utils/labels'

import css from './Header.less'
import Meta from './Meta'
import Source from './Source'
import SourceDetailsHeader from './SourceDetailsHeader'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string
    message: TicketMessage
    timezone: string
    isLastRead: boolean
    hasError?: boolean
    isMessageHidden?: boolean
    isMessageDeleted?: boolean
}

export default function Header(props: Props) {
    const {
        message,
        timezone,
        isLastRead,
        hasError,
        isMessageHidden,
        isMessageDeleted,
    } = props
    const sender = fromJS(message.sender || {}) as Map<any, any>
    const isForwarded = isForwardedMessage(message)
    let metaContent = (
        <Meta
            messageId={message.message_id}
            externalId={message.external_id}
            meta={message.meta}
            via={message.via}
            source={message.source}
            integrationId={message.integration_id}
            ruleId={message.rule_id}
            messageCreatedDatetime={message.created_datetime}
        />
    )

    let isDuplicated = false
    if (message.meta && message.meta.is_duplicated) {
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
                            className={css.agentIcon}
                        />
                    ) : (
                        <CustomerLabel customer={sender} />
                    )}
                </div>

                {message.source && (
                    <Source
                        id={props.id}
                        isForwarded={isForwarded}
                        createdDatetime={message.created_datetime}
                        source={message.source}
                    />
                )}
                {metaContent}
            </div>
            <SourceDetailsHeader
                className={css.sourceDetails}
                message={message}
                isLastRead={isLastRead}
                timezone={timezone}
                isMessageDeleted={isMessageDeleted}
            />
        </div>
    )
}
