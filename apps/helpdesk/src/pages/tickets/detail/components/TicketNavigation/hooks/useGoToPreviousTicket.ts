import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { getActiveView } from 'state/views/selectors'

import useIsTicketNavigationAvailable from './useIsTicketNavigationAvailable'
import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToPreviousTicket(ticketId: string) {
    const { isEnabled: isSplitTicketViewEnabled, previousTicketId } =
        useSplitTicketView()

    const { viewId } = useParams<{ viewId?: string }>()
    const activeView = useAppSelector(getActiveView)
    const isNavigationAvailable = useIsTicketNavigationAvailable(ticketId)
    const isSearchView = useMemo(
        () => activeView.get('search') != null,
        [activeView],
    )

    const goToPrevTicket = usePrevNextTicketNavigation('prev', ticketId || '')

    return {
        goToTicket:
            isSplitTicketViewEnabled && !isSearchView
                ? () => {
                      viewId &&
                          previousTicketId &&
                          history.push(
                              `/app/views/${viewId}/${previousTicketId}`,
                          )
                      return Promise.resolve()
                  }
                : goToPrevTicket,
        isEnabled:
            isSplitTicketViewEnabled && !isSearchView
                ? Boolean(previousTicketId)
                : isNavigationAvailable,
    }
}
