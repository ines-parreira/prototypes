import {useState} from 'react'

import {usePersistedState} from 'common/hooks'

import {TicketIds} from '../Context'

export default function useSplitTicketViewContext() {
    const [prevNextTicketIds, setPrevNextTicketIds] = useState<TicketIds>({
        prev: undefined,
        next: undefined,
    })
    const [shouldRedirectToSplitView, setShouldRedirectToSplitView] =
        useState(false)
    const [isEnabled, setIsEnabled] = usePersistedState(
        'split-ticket-view-enabled',
        true
    )

    return {
        isEnabled,
        setIsEnabled,
        previousTicketId: prevNextTicketIds.prev,
        nextTicketId: prevNextTicketIds.next,
        setPrevNextTicketIds,
        shouldRedirectToSplitView,
        setShouldRedirectToSplitView,
    }
}
