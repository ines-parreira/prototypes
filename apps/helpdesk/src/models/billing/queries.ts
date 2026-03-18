import type { UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { MutationOverrides } from '../../types/query'
import {
    deactivateAccount,
    extendTrial,
    fetchSubscription,
    getAiAgentGeneration6Plan,
    getBillingContact,
    getBillingState,
    getCouponsForSales,
    getProductsUsage,
    reactivateAccount,
    reactivateTrial,
    setIsAccountVetted,
    updateBillingContact,
    upgradeAiAgentSubscriptionGeneration6Plan,
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

export const getSubscriptionQuery = {
    queryKey: ['subscription'] as const,
    queryFn: fetchSubscription,
}

export type UseSubscription = Awaited<ReturnType<typeof fetchSubscription>>

export const useSubscription = (
    overrides?: UseQueryOptions<UseSubscription>,
) => {
    return useQuery({
        ...getSubscriptionQuery,
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

export const aiAgentGen6PlanQuery = {
    queryKey: ['aiAgentGeneration6Plan'] as const,
    queryFn: getAiAgentGeneration6Plan,
}

export type UseAiAgentGeneration6Plan = Awaited<
    ReturnType<typeof getAiAgentGeneration6Plan>
>

export const useAiAgentGeneration6Plan = (
    overrides?: UseQueryOptions<UseAiAgentGeneration6Plan>,
) =>
    useQuery({
        ...aiAgentGen6PlanQuery,
        ...overrides,
    })

export const useUpgradeAiAgentSubscriptionGeneration6Plan = (
    overrides?: MutationOverrides<
        typeof upgradeAiAgentSubscriptionGeneration6Plan
    >,
) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: upgradeAiAgentSubscriptionGeneration6Plan,
        ...overrides,
        onSuccess: (...args) => {
            // Invalidate billing state to refresh subscription
            queryClient.invalidateQueries({
                queryKey: billingKeys.all,
            })
            queryClient.invalidateQueries({
                queryKey: aiAgentGen6PlanQuery.queryKey,
            })
            overrides?.onSuccess?.(...args)
        },
        onError: (...args) => {
            overrides?.onError?.(...args)
        },
    })
}

export const useDeactivateAccount = (
    overrides?: MutationOverrides<typeof deactivateAccount>,
) => {
    return useMutation({
        mutationFn: deactivateAccount,
        ...overrides,
    })
}

export const useReactivateAccount = (
    overrides?: MutationOverrides<typeof reactivateAccount>,
) => {
    return useMutation({
        mutationFn: reactivateAccount,
        ...overrides,
    })
}

export const useSetIsVetted = (
    overrides?: MutationOverrides<typeof setIsAccountVetted>,
) => {
    return useMutation({
        mutationFn: (params) => setIsAccountVetted(...params),
        ...overrides,
    })
}

export const getProductsUsageQuery = {
    queryKey: ['productsUsage'] as const,
    queryFn: getProductsUsage,
}

export type UseProductsUsage = Awaited<ReturnType<typeof getProductsUsage>>

export const useProductsUsage = (
    overrides?: UseQueryOptions<UseProductsUsage>,
) => {
    return useQuery({
        ...getProductsUsageQuery,
        ...overrides,
    })
}
