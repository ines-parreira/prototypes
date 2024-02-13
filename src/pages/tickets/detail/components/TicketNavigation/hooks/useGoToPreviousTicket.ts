import {useFlags} from 'launchdarkly-react-client-sdk'
import {useParams} from 'react-router-dom'

import {useSplitTicketView} from 'split-ticket-view-toggle'
import history from 'pages/history'
import {FeatureFlagKey} from 'config/featureFlags'

import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToPreviousTicket(ticketId?: string) {
    const hasSplitTicketView: boolean | undefined =
        useFlags()[FeatureFlagKey.SplitTicketView]
    const {isEnabled: isSplitTicketViewEnabled, previousTicketId} =
        useSplitTicketView()

    const {viewId} = useParams<{viewId?: string}>()

    const goToPrevTicket = usePrevNextTicketNavigation('prev', ticketId || '')

    return {
        goToTicket:
            isSplitTicketViewEnabled && hasSplitTicketView
                ? () => {
                      viewId &&
                          previousTicketId &&
                          history.push(
                              `/app/views/${viewId}/${previousTicketId}`
                          )
                  }
                : goToPrevTicket,
        isEnabled:
            isSplitTicketViewEnabled &&
            hasSplitTicketView &&
            Boolean(previousTicketId),
    }
}
