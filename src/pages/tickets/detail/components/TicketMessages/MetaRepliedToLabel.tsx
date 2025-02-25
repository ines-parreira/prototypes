import React from 'react'

import { ReplyMetaTicketMessage } from 'models/ticket/types'

import MetaLabel from './MetaLabel'

import css from './MetaRepliedToLabel.less'

type Props = {
    reply: ReplyMetaTicketMessage
}

export default function MetaRepliedToLabel({ reply }: Props) {
    return (
        <MetaLabel>
            responded via Messenger to
            <span> </span>
            <a
                href={`${reply.ticket_id}`}
                className={css.link}
                target="_blank"
                rel="noopener noreferrer"
            >
                Comment
            </a>
        </MetaLabel>
    )
}
