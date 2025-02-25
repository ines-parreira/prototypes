import React from 'react'

import { useGetTicketMessage } from '@gorgias/api-queries'

import { Actor, ReplyMetaTicketMessage, Source } from 'models/ticket/types'
import TicketMessageEmbeddedCard from 'pages/common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'

type Props = {
    reply: ReplyMetaTicketMessage
}

export default function ReplyDetailsCard({ reply }: Props) {
    const { isSuccess, data } = useGetTicketMessage(
        reply.ticket_id,
        reply.ticket_message_id,
        {
            query: {
                refetchInterval: false,
                refetchOnWindowFocus: false,
            },
        },
    )

    if (!isSuccess) {
        return null
    }

    const message = data.data

    if (
        !message.integration_id ||
        !message.body_text ||
        !message.source?.type ||
        !message.sender?.id
    ) {
        return null
    }

    return (
        <TicketMessageEmbeddedCard
            integrationId={message.integration_id}
            messageText={message.body_text}
            source={message.source as Source}
            sender={message.sender as Actor}
        />
    )
}
