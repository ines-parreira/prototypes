import { DataTableBaseCell, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { TicketMessageSourceIcon } from '../../../../components/TicketMessageSourceIcon/TicketMessageSourceIcon'
import type { TicketMessageSource } from '../../../../components/TicketMessageSourceIcon/utils'
import { ticketMessageSourceToLabel } from '../../../../components/TicketMessageSourceIcon/utils'

type Props = {
    ticket: TicketCompact
}

export function ChannelCell({ ticket }: Props) {
    if (!ticket.channel) {
        return <DataTableBaseCell>{null}</DataTableBaseCell>
    }

    const source = ticket.channel as TicketMessageSource
    const label = ticketMessageSourceToLabel(source)

    return (
        <DataTableBaseCell>
            <Tooltip
                placement="right"
                trigger={() => <TicketMessageSourceIcon source={source} />}
            >
                <TooltipContent title={label} />
            </Tooltip>
        </DataTableBaseCell>
    )
}
