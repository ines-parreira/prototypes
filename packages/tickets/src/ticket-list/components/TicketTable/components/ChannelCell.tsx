import { DataTableBaseCell, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { TicketMessageSourceIcon } from '../../../../components/TicketMessageSourceIcon/TicketMessageSourceIcon'
import type { TicketMessageSource } from '../../../../components/TicketMessageSourceIcon/utils'
import { ticketMessageSourceToLabel } from '../../../../components/TicketMessageSourceIcon/utils'
import type { TicketTableCellLinkProps } from './TicketTableCellLink'
import { TicketTableCellLink } from './TicketTableCellLink'

type Props = {
    ticket: TicketCompact
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

export function ChannelCell({ ticket, linkProps }: Props) {
    if (!ticket.channel) {
        if (linkProps) {
            return (
                <TicketTableCellLink {...linkProps}>{null}</TicketTableCellLink>
            )
        }

        return <DataTableBaseCell>{null}</DataTableBaseCell>
    }

    const source = ticket.channel as TicketMessageSource
    const label = ticketMessageSourceToLabel(source)

    const content = (
        <Tooltip
            placement="right"
            trigger={() => <TicketMessageSourceIcon source={source} />}
        >
            <TooltipContent title={label} />
        </Tooltip>
    )

    if (linkProps) {
        return (
            <TicketTableCellLink {...linkProps}>{content}</TicketTableCellLink>
        )
    }

    return <DataTableBaseCell>{content}</DataTableBaseCell>
}
