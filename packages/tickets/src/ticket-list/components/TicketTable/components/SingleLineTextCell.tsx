import { DataTableBaseCell, OverflowTooltip } from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import type { TicketTableRow } from '../TicketTableColumns'
import { DisplayText } from './DisplayText'

export type SingleLineTextCellProps = CellContext<TicketTableRow, unknown> & {
    value: DisplayTextValue | null | undefined
}

export function SingleLineTextCell({
    value,
    ...cellContext
}: SingleLineTextCellProps) {
    if (!value?.text && !value?.highlightedHtml) {
        return <DataTableBaseCell {...cellContext}>{null}</DataTableBaseCell>
    }

    return (
        <DataTableBaseCell {...cellContext} alignItems="stretch">
            <OverflowTooltip placement="right">
                <DisplayText value={value} overflow="ellipsis" />
            </OverflowTooltip>
        </DataTableBaseCell>
    )
}
