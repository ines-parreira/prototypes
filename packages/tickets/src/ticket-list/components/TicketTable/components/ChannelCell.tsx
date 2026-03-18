import { DataTableBaseCell } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { TicketMessageSourceIcon } from '../../../../components/TicketMessageSourceIcon/TicketMessageSourceIcon'
import type { TicketMessageSource } from '../../../../components/TicketMessageSourceIcon/utils'

type Props = {
    ticket: TicketCompact
}

export function ChannelCell({ ticket }: Props) {
    if (!ticket.channel) {
        return <DataTableBaseCell>{null}</DataTableBaseCell>
    }

    return (
        <DataTableBaseCell>
            <TicketMessageSourceIcon
                source={ticket.channel as TicketMessageSource}
            />
        </DataTableBaseCell>
    )
}
