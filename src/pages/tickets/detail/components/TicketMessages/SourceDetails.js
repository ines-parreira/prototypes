//@flow
import SourceActions from './SourceActions'
import SeenIndicator from './SeenIndicator'
import {DatetimeLabel} from '../../../../common/utils/labels'
import React from 'react'
import type {TicketMessage} from '../../../../../models/ticketElement'
import css from './SourceDetails.less'
import classNamesBind from 'classnames/bind'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage,
    isLastRead: boolean,
    timezone: string,
    className?: string
}

export default (props: Props) => {
    const {message, isLastRead, timezone} = props
    return (
        <div className={classNames('wrapper', props.className)}>
            <SourceActions
                source={message.source}
                meta={message.meta}
                integrationId={message.integration_id}
                messageId={message.message_id}
                fromAgent={message.from_agent}
            />
            {message.from_agent && isLastRead && (
                <SeenIndicator
                    openedDatetime={message.opened_datetime}
                    timezone={timezone}
                />
            )}
            <DatetimeLabel
                dateTime={message.created_datetime}
                timezone={timezone}
            />
        </div>
    )
}
