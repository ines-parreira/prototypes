import { Icon } from '@gorgias/axiom'

import { getCustomerName } from '../helpers/getCustomerName'
import { useTicket } from '../hooks/useTicket'

import css from './TicketHeader.less'

type Props = {
    ticketId: number
}

export function TicketHeader({ ticketId }: Props) {
    const { data } = useTicket(ticketId)
    const ticket = data?.data

    if (!ticket) return <div className={css.container} />

    return (
        <div className={css.container}>
            <div className={css.left}>
                <span className={css.customer}>
                    {getCustomerName(ticket.customer)}
                </span>
                <span className={css.separator}>
                    <Icon name="arrow-chevron-right" size="sm" />
                </span>
                <span className={css.subject}>{ticket.subject}</span>
            </div>
        </div>
    )
}
