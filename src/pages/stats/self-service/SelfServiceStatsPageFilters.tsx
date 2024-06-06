import React, {useCallback} from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import SelfServiceIntegrationsFilter from 'pages/stats/self-service/SelfServiceIntegrationsFilter'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {getStatsFilters} from 'state/stats/selectors'

export const SelfServiceStatsPageFilters = () => {
    const dispatch = useAppDispatch()

    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)
    const handleIntegrationsFilterChange = useCallback(
        (values) => {
            dispatch(mergeStatsFilters({integrations: values as number[]}))
        },
        [dispatch]
    )

    return (
        <>
            <SelfServiceIntegrationsFilter
                onChange={handleIntegrationsFilterChange}
                value={statsFilters.integrations}
            />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
