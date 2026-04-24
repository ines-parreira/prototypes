import { DataTableBaseCell, OverflowTooltip } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import { DisplayText } from './DisplayText'
import type { TicketTableCellLinkProps } from './TicketTableCellLink'
import { TicketTableCellLink } from './TicketTableCellLink'

type Props = {
    value: DisplayTextValue | null | undefined
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

export function SingleLineTextCell({ value, linkProps }: Props) {
    const content =
        !value?.text && !value?.highlightedHtml ? null : (
            <OverflowTooltip placement="right">
                <DisplayText value={value} overflow="ellipsis" />
            </OverflowTooltip>
        )

    if (linkProps) {
        return (
            <TicketTableCellLink {...linkProps} alignItems="stretch">
                {content}
            </TicketTableCellLink>
        )
    }

    return <DataTableBaseCell alignItems="stretch">{content}</DataTableBaseCell>
}
