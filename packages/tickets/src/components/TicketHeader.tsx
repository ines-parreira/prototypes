import { Link } from 'react-router-dom'

import { Breadcrumb, Breadcrumbs } from '@gorgias/axiom'

import { getCustomerName } from '../helpers/getCustomerName'
import { useTicket } from '../hooks/useTicket'
import { TicketActions } from './TicketActions/TicketActions'
import { TeamAssignee, UserAssignee } from './TicketAssignee'
import { TicketPriority } from './TicketPriority'
import { TicketViewNavigator } from './TicketViewNavigator/TicketViewNavigator'
import { TrashedTicket } from './TrashedTicket'

import css from './TicketHeader.less'

type Props = {
    ticketId: number
}

export function TicketHeader({ ticketId }: Props) {
    const { data } = useTicket(ticketId)
    const ticket = data?.data

    if (!ticket) return <div className={css.container} />

    const {
        priority: currentPriority,
        assignee_team: currentTeam,
        assignee_user: currentAssignee,
        trashed_datetime,
    } = ticket

    return (
        <div className={css.container}>
            <div className={css.left}>
                <Breadcrumbs>
                    <Breadcrumb>
                        <Link to={`/app/customer/${ticket.customer.id}`}>
                            {getCustomerName(ticket.customer)}
                        </Link>
                    </Breadcrumb>
                    <Breadcrumb>{ticket.subject}</Breadcrumb>
                </Breadcrumbs>
            </div>
            <div className={css.right}>
                <TrashedTicket trashedDatetime={trashed_datetime} />
                <TicketPriority
                    ticketId={ticketId}
                    currentPriority={currentPriority}
                />
                <UserAssignee
                    ticketId={ticketId}
                    currentAssignee={currentAssignee}
                />
                <TeamAssignee ticketId={ticketId} currentTeam={currentTeam} />
                <TicketActions
                    id={ticketId}
                    spam={ticket.spam}
                    isUnread={ticket.is_unread}
                    isTrashed={Boolean(trashed_datetime)}
                />
                <TicketViewNavigator />
            </div>
        </div>
    )
}
