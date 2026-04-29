import type { CellContext } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import type { TicketTableRow } from '../TicketTableColumns'
import { SingleLineTextCell } from './SingleLineTextCell'

export type CustomerCellProps = CellContext<TicketTableRow, unknown> & {
    value: DisplayTextValue
}

export function CustomerCell({ value, ...cellContext }: CustomerCellProps) {
    return <SingleLineTextCell {...cellContext} value={value} />
}
