import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchDiscountCodesAppliedTrend,
    useDiscountCodesAppliedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAppliedTrend'
import {
    fetchDiscountCodesOfferedTrend,
    useDiscountCodesOfferedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesOfferedTrend'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import { calculateRate } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'

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
