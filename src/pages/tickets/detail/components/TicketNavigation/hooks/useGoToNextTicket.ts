import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { isTicketNavigationAvailable } from 'state/ticket/actions'
import { getActiveView } from 'state/views/selectors'

import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToNextTicket(ticketId: string) {
    const { isEnabled: isSplitTicketViewEnabled, nextTicketId } =
        useSplitTicketView()

    const { viewId } = useParams<{ viewId?: string }>()
    const activeView = useAppSelector(getActiveView)
    const dispatch = useAppDispatch()
    const isSearchView = useMemo(
        () => activeView.get('search') != null,
        [activeView],
    )

    const goToNextTicket = usePrevNextTicketNavigation('next', ticketId || '')

    return {
        goToTicket:
            isSplitTicketViewEnabled && !isSearchView
                ? () => {
                      viewId &&
                          nextTicketId &&
                          history.push(`/app/views/${viewId}/${nextTicketId}`)
                      return Promise.resolve()
                  }
                : goToNextTicket,
        isEnabled:
            isSplitTicketViewEnabled && !isSearchView
                ? Boolean(nextTicketId)
                : dispatch(isTicketNavigationAvailable(ticketId)),
    }
}
