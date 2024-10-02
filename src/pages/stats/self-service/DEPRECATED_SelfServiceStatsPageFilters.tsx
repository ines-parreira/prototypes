import React, {useCallback} from 'react'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_SelfServiceIntegrationsFilter from 'pages/stats/self-service/DEPRECATED_SelfServiceIntegrationsFilter'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {
    getPageStatsFiltersWithLogicalOperators,
    getStatsFilters,
} from 'state/stats/selectors'

export const DEPRECATED_SelfServiceStatsPageFilters = () => {
    const dispatch = useAppDispatch()

    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators
    )
    const statsFilters = useAppSelector(getStatsFilters)
    const handleIntegrationsFilterChange = useCallback(
        (values) => {
            dispatch(mergeStatsFilters({integrations: values as number[]}))
        },
        [dispatch]
    )

    return (
        <>
            <DEPRECATED_SelfServiceIntegrationsFilter
                onChange={handleIntegrationsFilterChange}
                value={statsFilters.integrations}
            />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
