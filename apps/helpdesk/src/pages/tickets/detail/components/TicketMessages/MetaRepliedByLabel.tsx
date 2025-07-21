import { useGetTicketMessage } from '@gorgias/helpdesk-queries'

import { ReplyMetaTicketMessage } from 'models/ticket/types'
import { AgentLabel } from 'pages/common/utils/labels'

import MetaLabel from './MetaLabel'

import css from './MetaRepliedByLabel.less'

type Props = {
    reply: ReplyMetaTicketMessage
}

export default function MetaRepliedByLabel({ reply }: Props) {
    const { isLoading, data } = useGetTicketMessage(
        reply.ticket_id,
        reply.ticket_message_id,
        {
            query: {
                refetchInterval: false,
                refetchOnWindowFocus: false,
            },
        },
    )

    const senderName = data?.data?.sender?.name

    return (
        <MetaLabel isLoading={isLoading}>
            responded to via Messenger
            {senderName && (
                <>
                    <span> by </span>
                    <AgentLabel name={senderName} />
                </>
            )}
            <span> - </span>
            <a
                href={`${reply.ticket_id}`}
                className={css.link}
                target="_blank"
                rel="noopener noreferrer"
            >
                View ticket
            </a>
        </MetaLabel>
    )
}
