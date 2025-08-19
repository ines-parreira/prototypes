import { useMemo } from 'react'

import type { TicketInfobarTab } from '@repo/navigation'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { getActiveView } from 'state/views/selectors'

import useIsTicketNavigationAvailable from './useIsTicketNavigationAvailable'
import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToNextTicket(
    ticketId: string,
    activeTab?: TicketInfobarTab,
) {
    const { isEnabled: isSplitTicketViewEnabled, nextTicketId } =
        useSplitTicketView()

    const { viewId } = useParams<{ viewId?: string }>()
    const activeView = useAppSelector(getActiveView)
    const isNavigationAvailable = useIsTicketNavigationAvailable(ticketId)
    const isSearchView = useMemo(
        () => activeView.get('search') != null,
        [activeView],
    )
    const activeTabQueryParam = useMemo(
        () => (activeTab ? `?activeTab=${activeTab}` : ''),
        [activeTab],
    )

    const goToNextTicket = usePrevNextTicketNavigation('next', ticketId || '')

    return {
        goToTicket:
            isSplitTicketViewEnabled && !isSearchView
                ? () => {
                      viewId &&
                          nextTicketId &&
                          history.push(
                              `/app/views/${viewId}/${nextTicketId}${activeTabQueryParam}`,
                          )
                      return Promise.resolve()
                  }
                : goToNextTicket,
        isEnabled:
            isSplitTicketViewEnabled && !isSearchView
                ? Boolean(nextTicketId)
                : isNavigationAvailable,
    }
}
