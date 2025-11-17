import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { useSavedFilterById } from 'domains/reporting/hooks/filters/useSavedFilterById'
import { useSyncPinnedFilter } from 'domains/reporting/hooks/filters/useSyncPinnedFilter'

export const PinnedFilterSyncProvider = ({
    children,
    savedFilterId,
}: {
    children: ReactNode
    savedFilterId: number
}) => {
    const pinnedSavedFilter = useSavedFilterById(savedFilterId)

    const syncPinnedFilter = useSyncPinnedFilter()
    useEffect(() => {
        if (!pinnedSavedFilter.data) return

        const cleanup = syncPinnedFilter(pinnedSavedFilter.data)

        return () => cleanup()
    }, [pinnedSavedFilter.data, syncPinnedFilter])

    return <>{children}</>
}
