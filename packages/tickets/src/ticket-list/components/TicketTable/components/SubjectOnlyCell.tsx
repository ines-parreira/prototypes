import { DataTableBaseCell, OverflowTooltip } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import { DisplayText } from './DisplayText'
import type { TicketTableCellLinkProps } from './TicketTableCellLink'
import { TicketTableCellLink } from './TicketTableCellLink'

type Props = {
    value: DisplayTextValue
    isUnread?: boolean
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

export function SubjectOnlyCell({ value, isUnread = false, linkProps }: Props) {
    const content = (
        <OverflowTooltip>
            <DisplayText
                value={value}
                overflow="ellipsis"
                variant={isUnread ? 'bold' : 'regular'}
            />
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
