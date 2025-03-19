import React, { useCallback } from 'react'

import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { FilterKey } from 'models/stat/types'
import { Value } from 'pages/common/forms/SelectField/types'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_SelfServiceIntegrationsFilter from 'pages/stats/self-service/DEPRECATED_SelfServiceIntegrationsFilter'
import { getStatsFilters } from 'state/stats/selectors'
import { mergeStatsFilters } from 'state/stats/statsSlice'

/**
 * @deprecated
 * @date 2023-08-28
 * @type feature-component
 */
export const DEPRECATED_SelfServiceStatsPageFilters = () => {
    const dispatch = useAppDispatch()

    useCleanStatsFilters()
    const statsFilters = useAppSelector(getStatsFilters)
    const handleIntegrationsFilterChange = useCallback(
        (values: Value[]) => {
            dispatch(
                mergeStatsFilters({
                    [FilterKey.StoreIntegrations]: values.map(Number),
                }),
            )
        },
        [dispatch],
    )

    return (
        <>
            <DEPRECATED_SelfServiceIntegrationsFilter
                onChange={handleIntegrationsFilterChange}
                value={statsFilters[FilterKey.StoreIntegrations]}
            />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
