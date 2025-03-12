import { useMemo } from 'react'

import { StatsFilters } from 'models/stat/types'
import { calculateRate } from 'pages/stats/aiSalesAgent/metrics/utils'

import {
    fetchDiscountCodesApplied,
    useDiscountCodesApplied,
} from './useDiscountCodesApplied'
import {
    fetchDiscountCodesOffered,
    useDiscountCodesOffered,
} from './useDiscountCodesOffered'

const useDiscountCodesRateApplied = (
    filters: StatsFilters,
    timezone: string,
) => {
    const appliedCodeData = useDiscountCodesApplied(filters, timezone)
    const offeredCodeData = useDiscountCodesOffered(filters, timezone)

    const isFetching = appliedCodeData.isFetching || offeredCodeData.isFetching
    const isError = appliedCodeData.isError || offeredCodeData.isError

    const data = useMemo(() => {
        if (
            !appliedCodeData.data ||
            !offeredCodeData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        return {
            prevValue: calculateRate(
                appliedCodeData.data.prevValue,
                offeredCodeData.data.prevValue,
            ),
            value: calculateRate(
                appliedCodeData.data.value,
                offeredCodeData.data.value,
            ),
        }
    }, [appliedCodeData, offeredCodeData, isFetching, isError])

    return {
        isFetching,
        isError,
        data,
    }
}

const fetchDiscountCodesRateApplied = (
    filters: StatsFilters,
    timezone: string,
) => {
    return Promise.all([
        fetchDiscountCodesApplied(filters, timezone),
        fetchDiscountCodesOffered(filters, timezone),
    ])
        .then(([appliedCodeData, offeredCodeData]) => {
            const value = calculateRate(
                appliedCodeData.data?.value,
                offeredCodeData.data?.value,
            )

            const prevValue = calculateRate(
                appliedCodeData.data?.prevValue,
                offeredCodeData.data?.prevValue,
            )

            return {
                isFetching: false,
                isError: false,
                data: { value, prevValue },
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useDiscountCodesRateApplied, fetchDiscountCodesRateApplied }
