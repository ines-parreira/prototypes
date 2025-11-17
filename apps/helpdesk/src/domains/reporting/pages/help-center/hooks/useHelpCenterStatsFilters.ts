import { useEffect } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'

export const useHelpCenterStatsFilters = (
    initialState: Partial<StatsFilters>,
) => {
    const dispatch = useAppDispatch()
    useCleanStatsFilters()
    const { cleanStatsFilters } = useStatsFilters()

    useEffect(() => {
        dispatch(mergeStatsFiltersWithLogicalOperator(initialState))
    }, [initialState, dispatch])

    return [cleanStatsFilters]
}
