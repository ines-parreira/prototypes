import { memo, useState } from 'react'

import { v4 as uuidv4 } from 'uuid'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { TicketMessage } from 'models/ticket/types'
import { isInternalNote } from 'tickets/common/utils'

import css from './MessageStatusIndicator.style.less'

export enum MessageStatus {
    Transient = 'transient', // has been created within the web app but not yet on our backend
    Pending = 'pending', // has been created on our backend but hasn't been delivered yet
    Failed = 'failed',
    Sent = 'sent',
    Opened = 'opened',
}

export const getMessageStatus = (message: TicketMessage): MessageStatus => {
    if (!message.id) {
        return MessageStatus.Transient
    } else if (!!message.failed_datetime) {
        return MessageStatus.Failed
    } else if (!!message.opened_datetime) {
        return MessageStatus.Opened
    } else if (!!message.sent_datetime) {
        return MessageStatus.Sent
    }
    return MessageStatus.Pending
}

const messageStatusToIndicator = {
    [MessageStatus.Transient]: {
        indicator: 'watch_later',
        tooltipText: 'Sending',
    },
    [MessageStatus.Pending]: {
        indicator: 'schedule',
        tooltipText: 'Pending',
    },
    [MessageStatus.Failed]: {
        indicator: 'error_outline',
        tooltipText: 'Failed',
    },
    [MessageStatus.Opened]: {
        indicator: 'done_all',
        tooltipText: 'Read',
    },
    [MessageStatus.Sent]: {
        indicator: 'done',
        tooltipText: 'Delivered',
    },
}

type Props = {
    message: TicketMessage
}

function MessageStatusIndicator({ message }: Props) {
    const [elementId] = useState(
        `message-status-indicator-id-${message.id ?? uuidv4()}`,
    )

    const messageStatus = getMessageStatus(message)
    const { indicator, tooltipText } = messageStatusToIndicator[messageStatus]

    if (
        !message.from_agent ||
        messageStatus === MessageStatus.Pending ||
        isInternalNote(message.source?.type)
    ) {
        // for now we don't want to display anything for the `Pending` status
        // as there are many use cases for which messages could remain in this
        // state indefinitely (e.g. messages created by third party apps that
        // never set the sent/opened/failed datetimes)
        return <></>
    }

    return (
        <span>
            <i id={elementId} className="material-icons-outlined mr-2">
                {indicator}
            </i>
            <Tooltip placement="top" target={elementId} className={css.tooltip}>
                {tooltipText}
            </Tooltip>
        </span>
    )
}

export default memo(MessageStatusIndicator)
