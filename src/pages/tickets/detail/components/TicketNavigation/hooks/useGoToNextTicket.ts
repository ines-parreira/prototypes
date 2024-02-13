import {useFlags} from 'launchdarkly-react-client-sdk'
import {useParams} from 'react-router-dom'

import {useSplitTicketView} from 'split-ticket-view-toggle'
import history from 'pages/history'
import {FeatureFlagKey} from 'config/featureFlags'

import usePrevNextTicketNavigation from './usePrevNextTicketNavigation'

export default function useGoToNextTicket(ticketId: string) {
    const hasSplitTicketView: boolean | undefined =
        useFlags()[FeatureFlagKey.SplitTicketView]
    const {isEnabled: isSplitTicketViewEnabled, nextTicketId} =
        useSplitTicketView()

    const {viewId} = useParams<{viewId?: string}>()

    const goToNextTicket = usePrevNextTicketNavigation('next', ticketId)

    return {
        goToTicket:
            hasSplitTicketView && isSplitTicketViewEnabled
                ? () => {
                      viewId &&
                          nextTicketId &&
                          history.push(`/app/views/${viewId}/${nextTicketId}`)
                  }
                : goToNextTicket,
        isEnabled:
            hasSplitTicketView &&
            isSplitTicketViewEnabled &&
            Boolean(nextTicketId),
    }
}
