import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'
import {MutationOverrides} from '../../types/query'
import {
    extendTrial,
    getBillingState,
    getCouponsForSales,
    reactivateTrial,
} from './resources'

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

export const useExtendTrial = (
    overrides?: MutationOverrides<typeof extendTrial>
) => {
    return useMutation({
        mutationFn: extendTrial,
        ...overrides,
    })
}

export const useReactivateTrial = (
    overrides?: MutationOverrides<typeof reactivateTrial>
) => {
    return useMutation({
        mutationFn: reactivateTrial,
        ...overrides,
    })
}
