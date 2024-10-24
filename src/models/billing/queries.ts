import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'

import {MutationOverrides} from '../../types/query'
import {
    extendTrial,
    getBillingContact,
    getBillingState,
    getCouponsForSales,
    getCreditCard,
    reactivateTrial,
    updateBillingContact,
} from './resources'

export const billingKeys = {
    all: ['billing'] as const,
    contact: () => [...billingKeys.all, 'contact'] as const,
    creditCard: () => [...billingKeys.all, 'creditCard'] as const,
}

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

export const useBillingContact = (
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getBillingContact>>>
) =>
    useQuery({
        queryKey: billingKeys.contact(),
        queryFn: getBillingContact,
        ...overrides,
    })

export const useUpdateBillingContact = (
    overrides?: MutationOverrides<typeof updateBillingContact>
) =>
    useMutation({
        mutationFn: (params) => updateBillingContact(...params),
        ...overrides,
    })

export const useCreditCard = (
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getCreditCard>>>
) =>
    useQuery({
        queryKey: billingKeys.creditCard(),
        queryFn: getCreditCard,
        ...overrides,
    })
