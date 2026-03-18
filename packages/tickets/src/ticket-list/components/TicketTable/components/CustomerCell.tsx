import type { TicketCompact } from '@gorgias/helpdesk-types'

import { useTicketDisplayData } from '../../../hooks/useTicketDisplayData'
import { SingleLineTextCell } from './SingleLineTextCell'

type Props = {
    ticket: TicketCompact
}

export function CustomerCell({ ticket }: Props) {
    const { customerName } = useTicketDisplayData({ ticket })

    return <SingleLineTextCell value={customerName} />
}
