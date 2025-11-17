import { useCallback } from 'react'

import type { SavedFilter } from 'domains/reporting/models/stat/types'
import {
    actions,
    selectors,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

const useApplyPinnedFilter = () => {
    const dispatch = useAppDispatch()

    return useCallback(
        (filter: ArgumentsOf<typeof actions.applyPinnedFilter>[0]) =>
            dispatch(actions.applyPinnedFilter(filter)),
        [dispatch],
    )
}

const useClearPinnedFilter = () => {
    const dispatch = useAppDispatch()

    return useCallback(
        () => dispatch(actions.clearPinnedFilterDraft()),
        [dispatch],
    )
}

const useAppliedPinnedFilterId = () => {
    return useAppSelector(selectors.getPinnedFilterAppliedId)
}

export const useSyncPinnedFilter = () => {
    const applyPinnedFilter = useApplyPinnedFilter()
    const clearPinnedFilter = useClearPinnedFilter()

    const appliedPinnedFilterId = useAppliedPinnedFilterId()

    return useCallback(
        (savedFilter: SavedFilter) => {
            if (savedFilter.id !== appliedPinnedFilterId) {
                applyPinnedFilter(savedFilter)
            }

            return () => {
                if (savedFilter.id === appliedPinnedFilterId) {
                    clearPinnedFilter()
                }
            }
        },
        [appliedPinnedFilterId, applyPinnedFilter, clearPinnedFilter],
    )
}
