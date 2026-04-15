import { DataTableBaseCell, OverflowTooltip } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import { DisplayText } from './DisplayText'

type Props = {
    value: DisplayTextValue
    isUnread?: boolean
}

export function SubjectOnlyCell({ value, isUnread = false }: Props) {
    return (
        <DataTableBaseCell alignItems="stretch">
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
