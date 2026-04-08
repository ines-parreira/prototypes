import type { TableV1CellContext } from '@gorgias/axiom'

import type { Field } from '../MetafieldsTable/types'

export const getCheckboxContent = (
    originalCell: unknown,
    info: TableV1CellContext<Field, unknown>,
): React.ReactNode => {
    return typeof originalCell === 'function' ? originalCell(info) : null
}
