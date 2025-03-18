import { StatsFilters } from 'models/stat/types'
import { calculateRate } from 'pages/stats/aiSalesAgent/metrics/utils'

import {
    fetchDiscountCodesAppliedTrend,
    useDiscountCodesAppliedTrend,
} from './useDiscountCodesAppliedTrend'
import {
    fetchDiscountCodesOfferedTrend,
    useDiscountCodesOfferedTrend,
} from './useDiscountCodesOfferedTrend'
import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'

const useDiscountCodesRateAppliedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useGenericTrend(
        {
            appliedCodeData: useDiscountCodesAppliedTrend(filters, timezone),
            offeredCodeData: useDiscountCodesOfferedTrend(filters, timezone),
        },
        ({ appliedCodeData, offeredCodeData }) =>
            calculateRate(appliedCodeData, offeredCodeData),
    )

const fetchDiscountCodesRateAppliedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchGenericTrend(
        {
            appliedCodeData: fetchDiscountCodesAppliedTrend(filters, timezone),
            offeredCodeData: fetchDiscountCodesOfferedTrend(filters, timezone),
        },
        ({ appliedCodeData, offeredCodeData }) =>
            calculateRate(appliedCodeData, offeredCodeData),
    )

export { useDiscountCodesRateAppliedTrend, fetchDiscountCodesRateAppliedTrend }
