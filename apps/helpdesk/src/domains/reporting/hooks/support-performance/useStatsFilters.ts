import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

export const useStatsFilters = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    )

    return {
        cleanStatsFilters,
        userTimezone,
        granularity,
    }
}
