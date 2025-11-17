import classNamesBind from 'classnames/bind'
import { fromJS } from 'immutable'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'

import css from './MessageAttachments.less'

const classNames = classNamesBind.bind(css)

type MessageAttachmentsProps = {
    message: TicketMessage
}

export function MessageAttachments({ message }: MessageAttachmentsProps) {
    if (!message.attachments || !message.attachments.length) {
        return null
    }

    return (
        <div className={classNames('pt-4', 'wrapper')}>
            <span className={classNames('label')}>
                <i className="icon mr-1 material-icons">attachment</i>
                New media files
            </span>
            <TicketAttachments
                context="ticket-message"
                className={css.attachments}
                attachments={fromJS(message.attachments || [])}
            />
        </div>
    )
}
