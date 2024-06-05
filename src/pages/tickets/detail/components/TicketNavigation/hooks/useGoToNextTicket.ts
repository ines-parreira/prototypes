import {useParams} from 'react-router-dom'

import {useSplitTicketView} from 'split-ticket-view-toggle'
import history from 'pages/history'

import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToNextTicket(ticketId?: string) {
    const {isEnabled: isSplitTicketViewEnabled, nextTicketId} =
        useSplitTicketView()

    const {viewId} = useParams<{viewId?: string}>()

    const goToNextTicket = usePrevNextTicketNavigation('next', ticketId || '')

    return {
        goToTicket: isSplitTicketViewEnabled
            ? () => {
                  viewId &&
                      nextTicketId &&
                      history.push(`/app/views/${viewId}/${nextTicketId}`)
              }
            : goToNextTicket,
        isEnabled: isSplitTicketViewEnabled && Boolean(nextTicketId),
    }
}
