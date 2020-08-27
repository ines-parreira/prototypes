//@flow
import classnames from 'classnames'
import React from 'react'

import type {TicketMessage} from '../../../../../models/ticket'
import {DatetimeLabel} from '../../../../common/utils/labels'

import SeenIndicator from './SeenIndicator'
import SourceActionsHeader from './SourceActionsHeader'
import css from './SourceDetails.less'

type Props = {
    message: TicketMessage,
    isLastRead: boolean,
    timezone: string,
    className?: string,
    isMessageDeleted?: boolean,
}

export default function SourceDetailsHeader(props: Props) {
    const {message, isLastRead, timezone, isMessageDeleted} = props
    let actionHeader

    if (!isMessageDeleted) {
        actionHeader = (
            <SourceActionsHeader
                source={message.source}
                meta={message.meta}
                integrationId={message.integration_id}
                messageId={message.message_id}
                fromAgent={message.from_agent}
            />
        )
    }

    return (
        <div className={classnames(css.wrapper, props.className)}>
            {actionHeader}
            {message.from_agent && isLastRead && (
                <SeenIndicator
                    openedDatetime={message.opened_datetime}
                    timezone={timezone}
                />
            )}
            <DatetimeLabel dateTime={message.created_datetime} />
        </div>
    )
}
