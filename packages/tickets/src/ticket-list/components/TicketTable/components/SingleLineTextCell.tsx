import { DataTableBaseCell, OverflowTooltip } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import { DisplayText } from './DisplayText'

type Props = {
    value: DisplayTextValue | null | undefined
}

export function SingleLineTextCell({ value }: Props) {
    if (!value?.text && !value?.highlightedHtml) {
        return <DataTableBaseCell>{null}</DataTableBaseCell>
    }

    return (
        <DataTableBaseCell alignItems="stretch">
            <OverflowTooltip>
                <DisplayText value={value} overflow="ellipsis" />
            </OverflowTooltip>
        </DataTableBaseCell>
    )
}
