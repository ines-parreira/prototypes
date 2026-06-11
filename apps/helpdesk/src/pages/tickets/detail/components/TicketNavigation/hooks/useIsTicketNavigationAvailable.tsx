import { useMemo } from 'react'

import { useAppSelector } from 'hooks/useAppSelector'
import { isTicketNavigationAvailable } from 'state/ticket/selectors'

export function useIsTicketNavigationAvailable(ticketId?: string) {
    const memoizedSelector = useMemo(
        () => isTicketNavigationAvailable(ticketId),
        [ticketId],
    )
    const isNavigationAvailable = useAppSelector(memoizedSelector)

    return isNavigationAvailable
}
