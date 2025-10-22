import React, { useCallback } from 'react'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import PeriodStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_SelfServiceIntegrationsFilter from 'domains/reporting/pages/self-service/DEPRECATED_SelfServiceIntegrationsFilter'
import { getStatsFilters } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Value } from 'pages/common/forms/SelectField/types'

import { PAST_YEAR } from '../constants'

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
            <PeriodStatsFilter
                value={statsFilters.period}
                excludeOptions={[PAST_YEAR]}
            />
        </>
    )
}
