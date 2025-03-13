import { useEffect } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import { StatsFilters } from 'models/stat/types'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'

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
