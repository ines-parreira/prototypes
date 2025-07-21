import { useEffect, useMemo } from 'react'

import _isEqual from 'lodash/isEqual'

import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { statFiltersWithLogicalOperatorsCleanWithPayload } from 'domains/reporting/state/ui/stats/actions'
import {
    getCleanStatsFilters,
    isCleanStatsDirty,
} from 'domains/reporting/state/ui/stats/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

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
