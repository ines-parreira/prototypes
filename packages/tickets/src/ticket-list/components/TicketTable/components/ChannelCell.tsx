import { DataTableBaseCell, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import { TicketMessageSourceIcon } from '../../../../components/TicketMessageSourceIcon/TicketMessageSourceIcon'
import type { TicketMessageSource } from '../../../../components/TicketMessageSourceIcon/utils'
import { ticketMessageSourceToLabel } from '../../../../components/TicketMessageSourceIcon/utils'
import type { TicketTableRow } from '../TicketTableColumns'

export type ChannelCellProps = CellContext<TicketTableRow, unknown>

export function ChannelCell(cellContext: ChannelCellProps) {
    const ticket = cellContext.row.original

    if (!ticket.channel) {
        return <DataTableBaseCell {...cellContext}>{null}</DataTableBaseCell>
    }

    const source = ticket.channel as TicketMessageSource
    const label = ticketMessageSourceToLabel(source)

    return (
        <DataTableBaseCell {...cellContext}>
            <Tooltip
                placement="right"
                trigger={() => <TicketMessageSourceIcon source={source} />}
            >
                <TooltipContent title={label} />
            </Tooltip>
        </DataTableBaseCell>
    )
}
