import { DataTableBaseCell, OverflowTooltip } from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import type { TicketTableRow } from '../TicketTableColumns'
import { DisplayText } from './DisplayText'

export type SubjectOnlyCellProps = CellContext<TicketTableRow, unknown> & {
    value: DisplayTextValue
    isUnread?: boolean
}

export function SubjectOnlyCell({
    value,
    isUnread = false,
    ...cellContext
}: SubjectOnlyCellProps) {
    return (
        <DataTableBaseCell {...cellContext} alignItems="stretch">
            <OverflowTooltip>
                <DisplayText
                    value={value}
                    overflow="ellipsis"
                    variant={isUnread ? 'bold' : 'regular'}
                />
            </OverflowTooltip>
        </DataTableBaseCell>
    )
}
