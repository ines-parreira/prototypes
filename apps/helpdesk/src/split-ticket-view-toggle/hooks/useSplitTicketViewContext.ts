import { useState } from 'react'

import { useLocalStorage } from '@gorgias/toolkit-react'

import type { TicketIds } from '../Context'

export function useSplitTicketViewContext() {
    const [prevNextTicketIds, setPrevNextTicketIds] = useState<TicketIds>({
        prev: undefined,
        next: undefined,
    })
    const [shouldRedirectToSplitView, setShouldRedirectToSplitView] =
        useState(false)
    const [isEnabled, setIsEnabled] = useLocalStorage(
        'split-ticket-view-enabled',
        true,
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
