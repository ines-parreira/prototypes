import type { UserDateTimePreferences } from '@repo/preferences'

import {
    DataTableBaseCell,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import { formatTicketTableDateTime } from '../../../utils/formatTicketTableDateTime'
import type { TicketTableRow } from '../TicketTableColumns'

export type DateTimeCellProps = CellContext<
    TicketTableRow,
    string | null | undefined
> & {
    preferences: UserDateTimePreferences
    isUnread?: boolean
}

export function DateTimeCell({
    preferences,
    isUnread = false,
    ...cellContext
}: DateTimeCellProps) {
    const formattedDatetime = formatTicketTableDateTime(
        cellContext.getValue(),
        preferences,
    )

    if (!formattedDatetime) {
        return <DataTableBaseCell {...cellContext}>{null}</DataTableBaseCell>
    }

    return (
        <DataTableBaseCell {...cellContext} alignItems="stretch">
            <Tooltip
                placement="right"
                trigger={() => (
                    <Text
                        overflow="ellipsis"
                        variant={isUnread ? 'bold' : 'regular'}
                    >
                        {formattedDatetime.cellLabel}
                    </Text>
                )}
            >
                <TooltipContent title={formattedDatetime.tooltipLabel} />
            </Tooltip>
        </DataTableBaseCell>
    )
}
