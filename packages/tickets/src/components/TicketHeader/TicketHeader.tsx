import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box } from '@gorgias/axiom'

import { DTPTicketHeaderToggle } from '../../dtp/DTPTicketHeaderToggle'
import { useTicket } from '../../hooks/useTicket'
import { TicketTranslationMenu } from '../../translations/components/TicketTranslationMenu'
import { SpamTicket } from '../SpamTicket'
import { TicketActions } from '../TicketActions/TicketActions'
import { TeamAssignee, UserAssignee } from '../TicketAssignee'
import { TicketStatusMenu } from '../TicketMenuStatus/TicketStatusMenu'
import { TicketPriority } from '../TicketPriority'
import { TicketViewNavigator } from '../TicketViewNavigator/TicketViewNavigator'
import { TrashedTicket } from '../TrashedTicket'
import {
    TicketHeaderContainer,
    TicketHeaderLeft,
    TicketHeaderRight,
} from './layout/TicketHeaderLayout'
import { CurrentTicketTitle } from './TicketTitle'

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
        spam,
    } = ticket

    return (
        <TicketHeaderContainer>
            <TicketHeaderLeft>
                <Box alignItems="center" gap="xxxs">
                    <Box flexShrink={0}>
                        <DTPTicketHeaderToggle />
                    </Box>
                    <Box flexGrow={1} minWidth={0}>
                        <CurrentTicketTitle ticket={ticket} />
                    </Box>
                </Box>
            </TicketHeaderLeft>
            <TicketHeaderRight>
                {spam && <SpamTicket />}
                <TrashedTicket trashedDatetime={trashed_datetime} />
                {hasMessagesTranslations && (
                    <TicketTranslationMenu ticket={ticket} />
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
            </TicketHeaderRight>
        </TicketHeaderContainer>
    )
}
