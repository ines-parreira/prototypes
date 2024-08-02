import {useEffect, useMemo} from 'react'
import _isEqual from 'lodash/isEqual'
import {useDispatch} from 'react-redux'
import useAppSelector from 'hooks/useAppSelector'
import {
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {fromFiltersWithLogicalOperators} from 'state/stats/utils'
import {
    statFiltersCleanWithPayload,
    statFiltersWithLogicalOperatorsCleanWithPayload,
} from 'state/ui/stats/actions'
import {getCleanStatsFilters, isCleanStatsDirty} from 'state/ui/stats/selectors'

export function useCleanStatsFilters(statsFilters: LegacyStatsFilters) {
    const cleanStatsFilters = useAppSelector(getCleanStatsFilters)
    const isFilterDirty = useAppSelector(isCleanStatsDirty)
    const dispatch = useDispatch()
    const cleanStatsShouldUpdate = useMemo(() => {
        return (
            !isFilterDirty &&
            !_isEqual(
                cleanStatsFilters &&
                    fromFiltersWithLogicalOperators(cleanStatsFilters),
                statsFilters
            )
        )
    }, [cleanStatsFilters, isFilterDirty, statsFilters])

    useEffect(() => {
        if (cleanStatsShouldUpdate) {
            dispatch(statFiltersCleanWithPayload(statsFilters))
        }
    }, [cleanStatsShouldUpdate, dispatch, statsFilters])

    return cleanStatsShouldUpdate
        ? statsFilters
        : (cleanStatsFilters &&
              fromFiltersWithLogicalOperators(cleanStatsFilters)) ??
              statsFilters
}

export function useCleanStatsFiltersWithLogicalOperators(
    statsFilters: StatsFiltersWithLogicalOperator
): StatsFiltersWithLogicalOperator {
    const cleanStatsFilters = useAppSelector(getCleanStatsFilters)
    const isFilterDirty = useAppSelector(isCleanStatsDirty)
    const dispatch = useDispatch()
    const cleanStatsShouldUpdate = useMemo(() => {
        return !isFilterDirty && !_isEqual(cleanStatsFilters, statsFilters)
    }, [cleanStatsFilters, isFilterDirty, statsFilters])

    useEffect(() => {
        if (cleanStatsShouldUpdate) {
            dispatch(
                statFiltersWithLogicalOperatorsCleanWithPayload(statsFilters)
            )
        }
    }, [cleanStatsShouldUpdate, dispatch, statsFilters])

    return cleanStatsShouldUpdate
        ? statsFilters
        : cleanStatsFilters ?? statsFilters
}
