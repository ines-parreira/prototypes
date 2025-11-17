import { useMemo } from 'react'

import { fromJS } from 'immutable'

import type { User } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import {
    getOtherAgentsOnTicket,
    getOtherAgentsTypingOnTicket,
} from 'state/agents/selectors'

import type { TicketPresenceState } from './useCollisionDetection'

export default function useSocketIOPresence(): TicketPresenceState {
    const agentsViewing =
        useAppSelector((state) =>
            getOtherAgentsOnTicket(state.ticket.get('id'))(state),
        ) || fromJS([])
    const agentsTyping =
        useAppSelector((state) =>
            getOtherAgentsTypingOnTicket(state.ticket.get('id'))(state),
        ) || fromJS([])

    const agentsViewingNotTyping = useMemo(
        () => agentsViewing.filter((userId) => !agentsTyping.contains(userId)),
        [agentsViewing, agentsTyping],
    )
    const hasBoth = useMemo(
        () => agentsTyping.size > 0 && agentsViewingNotTyping.size > 0,
        [agentsTyping, agentsViewingNotTyping],
    )

    return useMemo(
        () => ({
            agentsViewing: agentsViewing.toJS() as User[],
            agentsViewingNotTyping: agentsViewingNotTyping.toJS() as User[],
            agentsTyping: agentsTyping.toJS() as User[],
            hasBoth,
        }),
        [agentsViewing, agentsViewingNotTyping, agentsTyping, hasBoth],
    )
}
