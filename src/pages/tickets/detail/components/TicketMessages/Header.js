//@flow
import React from 'react'
import {fromJS} from 'immutable'
import classNamesBind from 'classnames/bind'
import Meta from './Meta'
import {AgentLabel, CustomerLabel} from '../../../../common/utils/labels'
import {isForwardedMessage} from '../../../../../state/ticket/utils'
import Source from './Source'
import css from './Header.less'
import type {TicketMessage} from '../../../../../models/ticketElement/types'
import SourceDetails from './SourceDetails'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string,
    message: TicketMessage,
    timezone: string,
    isLastRead: boolean,
    hasError?: boolean
}

export default (props: Props) => {
    const {message, timezone, isLastRead, hasError} = props
    const sender = fromJS(message.sender || {})
    const isForwarded = isForwardedMessage(message)
    return (
        <div className={classNames(css.header, {
            hasError: hasError,
        })}>
            <div className={css.headerDetails}>
                <div className={classNames(css.author, {
                    isAgent: message.from_agent,
                })}>
                    {
                        message.from_agent ? (
                            <AgentLabel
                                name={sender.get('name')}
                                className={css.agentIcon}
                            />
                        ) : <CustomerLabel customer={sender}/>
                    }
                </div>

                {message.source && (
                    <Source
                        id={props.id}
                        isForwarded={isForwarded}
                        createdDatetime={message.created_datetime}
                        source={message.source}
                    />
                )}

                <Meta
                    messageId={message.message_id}
                    meta={message.meta}
                    via={message.via}
                    source={message.source}
                    integrationId={message.integration_id}
                    ruleId={message.rule_id}
                />
            </div>
            <SourceDetails
                className={css.sourceDetails}
                message={message}
                isLastRead={isLastRead}
                timezone={timezone}
            />
        </div>
    )
}
