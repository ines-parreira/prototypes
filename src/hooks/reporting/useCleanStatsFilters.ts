import { useEffect, useMemo } from 'react'

import _isEqual from 'lodash/isEqual'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { statFiltersWithLogicalOperatorsCleanWithPayload } from 'state/ui/stats/actions'
import {
    getCleanStatsFilters,
    isCleanStatsDirty,
} from 'state/ui/stats/selectors'

export function useCleanStatsFilters() {
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    const cleanStatsFilters = useAppSelector(getCleanStatsFilters)
    const isFilterDirty = useAppSelector(isCleanStatsDirty)
    const dispatch = useAppDispatch()
    const cleanStatsShouldUpdate = useMemo(() => {
        return !isFilterDirty && !_isEqual(cleanStatsFilters, statsFilters)
    }, [cleanStatsFilters, isFilterDirty, statsFilters])

    useEffect(() => {
        if (cleanStatsShouldUpdate) {
            dispatch(
                statFiltersWithLogicalOperatorsCleanWithPayload(statsFilters),
            )
        }
    }, [cleanStatsShouldUpdate, dispatch, statsFilters])
}
