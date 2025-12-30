import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useTicket } from '../../hooks/useTicket'
import { TicketTranslationMenu } from '../../translations/components/TicketTranslationMenu'
import { TicketActions } from '../TicketActions/TicketActions'
import { TeamAssignee, UserAssignee } from '../TicketAssignee'
import { TicketStatusMenu } from '../TicketMenuStatus/TicketStatusMenu'
import { TicketPriority } from '../TicketPriority'
import { TicketViewNavigator } from '../TicketViewNavigator/TicketViewNavigator'
import { TrashedTicket } from '../TrashedTicket'
import { TicketTitle } from './TicketTitle/TicketTitle'

import css from './TicketHeader.less'

type Props = {
    ticketId: number
}

export function TicketHeader({ ticketId }: Props) {
    const { data } = useTicket(ticketId)
    const hasMessagesTranslations = useFlag(FeatureFlagKey.MessagesTranslations)

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
                <TicketTitle ticket={ticket} />
            </div>
            <div className={css.right}>
                <TrashedTicket trashedDatetime={trashed_datetime} />
                {hasMessagesTranslations && (
                    <TicketTranslationMenu language={ticket.language} />
                )}
                <TicketStatusMenu ticket={ticket} />
                <TicketPriority
                    ticketId={ticketId}
                    currentPriority={currentPriority}
                />
                <UserAssignee
                    ticketId={ticketId}
                    currentAssignee={currentAssignee}
                />
                <TeamAssignee ticketId={ticketId} currentTeam={currentTeam} />
                <TicketActions {...ticket} />
                <TicketViewNavigator />
            </div>
        </div>
    )
}
