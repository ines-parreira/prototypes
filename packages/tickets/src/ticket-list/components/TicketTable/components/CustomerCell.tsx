import type { DisplayTextValue } from '../../../types/display'
import { SingleLineTextCell } from './SingleLineTextCell'
import type { TicketTableCellLinkProps } from './TicketTableCellLink'

type Props = {
    value: DisplayTextValue
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

export function CustomerCell({ value, linkProps }: Props) {
    return <SingleLineTextCell value={value} linkProps={linkProps} />
}
