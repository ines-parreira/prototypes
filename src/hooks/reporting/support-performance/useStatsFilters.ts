import useAppSelector from 'hooks/useAppSelector'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'state/ui/stats/selectors'

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
