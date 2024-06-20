import {UseQueryOptions, useQuery} from '@tanstack/react-query'
import {getBillingState, getCouponsForSales} from './resources'

export const getBillingStateQuery = {
    queryKey: ['billingState'],
    queryFn: getBillingState,
}

export type UseGetBillingState = Awaited<ReturnType<typeof getBillingState>>

export const useBillingState = (
    overrides?: UseQueryOptions<UseGetBillingState>
) => {
    return useQuery({
        ...getBillingStateQuery,
        ...overrides,
    })
}

export const getCouponsForSalesQuery = {
    queryKey: ['couponsForSales'],
    queryFn: getCouponsForSales,
}

export type UseSalesCoupons = Awaited<ReturnType<typeof getCouponsForSales>>

export const useSalesCoupons = (
    overrides?: UseQueryOptions<UseSalesCoupons>
) => {
    return useQuery({
        ...getCouponsForSalesQuery,
        ...overrides,
    })
}
