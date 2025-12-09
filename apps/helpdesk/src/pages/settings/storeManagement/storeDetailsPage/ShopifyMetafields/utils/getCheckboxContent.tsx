import type { CellContext } from '@gorgias/axiom'

import type { Field } from '../MetafieldsTable/types'

export const getCheckboxContent = (
    originalCell: unknown,
    info: CellContext<Field, unknown>,
): React.ReactNode => {
    return typeof originalCell === 'function' ? originalCell(info) : null
}
