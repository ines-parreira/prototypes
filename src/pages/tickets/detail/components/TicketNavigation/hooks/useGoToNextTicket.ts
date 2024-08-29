import {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {useSplitTicketView} from 'split-ticket-view-toggle'
import history from 'pages/history'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {getActiveView} from 'state/views/selectors'
import {isTicketNavigationAvailable} from 'state/ticket/actions'

import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToNextTicket(ticketId: string) {
    const {isEnabled: isSplitTicketViewEnabled, nextTicketId} =
        useSplitTicketView()

    const {viewId} = useParams<{viewId?: string}>()
    const activeView = useAppSelector(getActiveView)
    const dispatch = useAppDispatch()
    const isSearchView = useMemo(
        () => activeView.get('search') != null,
        [activeView]
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
