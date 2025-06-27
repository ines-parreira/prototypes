import classnames from 'classnames'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { MessageStatusIndicator } from 'tickets/ticket-detail/components/MessageStatusIndicator'
import { SourceDetailsInfo } from 'tickets/ticket-detail/components/SourceDetailsInfo'

import css from './MessageMetadata.less'

type Props = {
    message: TicketMessage
}

export function MessageMetadata({ message }: Props) {
    return (
        <div className={classnames(css.wrapper)}>
            <MessageStatusIndicator message={message as TicketMessage} />
            <SourceDetailsInfo
                datetime={message.created_datetime}
                meta={message.meta ?? undefined}
            />
        </div>
    )
}
