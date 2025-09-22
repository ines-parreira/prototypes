import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'

import { MutationOverrides } from '../../types/query'
import {
    extendTrial,
    getBillingContact,
    getBillingState,
    getCouponsForSales,
    reactivateTrial,
    updateBillingContact,
} from './resources'

export const billingKeys = {
    all: ['billing'] as const,
    contact: () => [...billingKeys.all, 'contact'] as const,
}

export const getBillingStateQuery = {
    queryKey: ['billingState'],
    queryFn: getBillingState,
}

export type UseGetBillingState = Awaited<ReturnType<typeof getBillingState>>

export const useBillingState = (
    overrides?: UseQueryOptions<UseGetBillingState>,
) => {
    return useQuery({
        ...getBillingStateQuery,
        ...overrides,
        staleTime: 1 * 60 * 60 * 1000, // cache for 1 hour
        refetchOnWindowFocus: true,
    })
}

export const getCouponsForSalesQuery = {
    queryKey: ['couponsForSales'],
    queryFn: getCouponsForSales,
}

export type UseSalesCoupons = Awaited<ReturnType<typeof getCouponsForSales>>

export const useSalesCoupons = (
    overrides?: UseQueryOptions<UseSalesCoupons>,
) => {
    return useQuery({
        ...getCouponsForSalesQuery,
        ...overrides,
    })
}

export const useExtendTrial = (
    overrides?: MutationOverrides<typeof extendTrial>,
) => {
    return useMutation({
        mutationFn: extendTrial,
        ...overrides,
    })
}

export const useReactivateTrial = (
    overrides?: MutationOverrides<typeof reactivateTrial>,
) => {
    return useMutation({
        mutationFn: reactivateTrial,
        ...overrides,
    })
}

export const useBillingContact = (
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof getBillingContact>>>,
) =>
    useQuery({
        queryKey: billingKeys.contact(),
        queryFn: getBillingContact,
        ...overrides,
    })

export const useUpdateBillingContact = (
    overrides?: MutationOverrides<typeof updateBillingContact>,
) =>
    useMutation({
        mutationFn: (params) => updateBillingContact(...params),
        ...overrides,
    })
