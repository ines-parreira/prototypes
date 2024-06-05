import {useParams} from 'react-router-dom'

import {useSplitTicketView} from 'split-ticket-view-toggle'
import history from 'pages/history'

import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToPreviousTicket(ticketId?: string) {
    const {isEnabled: isSplitTicketViewEnabled, previousTicketId} =
        useSplitTicketView()

    const {viewId} = useParams<{viewId?: string}>()

    const goToPrevTicket = usePrevNextTicketNavigation('prev', ticketId || '')

    return {
        goToTicket: isSplitTicketViewEnabled
            ? () => {
                  viewId &&
                      previousTicketId &&
                      history.push(`/app/views/${viewId}/${previousTicketId}`)
              }
            : goToPrevTicket,
        isEnabled: isSplitTicketViewEnabled && Boolean(previousTicketId),
    }
}
