import type { UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Duration } from '@gorgias/toolkit'

import type { MutationOverrides } from 'types/query'

import {
    createPostStoreInstallationStep,
    getPostStoreInstallationSteps,
    updatePostStoreInstallationStep,
    updateStepConfiguration,
    updateStepNotifications,
} from './configuration'
import type { GetPostStoreInstallationStepsParams } from './types'

// Post-Store Installation Steps
export const postStoreInstallationStepsKeys = {
    all: () => ['postStoreInstallationSteps'] as const,
    details: () => [...postStoreInstallationStepsKeys.all(), 'detail'] as const,
    detail: ({
        accountDomain,
        shopName,
    }: {
        accountDomain: string
        shopName: string
    }) =>
        [
            ...postStoreInstallationStepsKeys.details(),
            accountDomain,
            shopName,
        ] as const,
}

export const useGetPostStoreInstallationStepsPure = (
    params: GetPostStoreInstallationStepsParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getPostStoreInstallationSteps>>
    >,
) => {
    return useQuery({
        queryKey: postStoreInstallationStepsKeys.detail({
            accountDomain: String(params.accountId),
            shopName: params.shopName,
        }),
        queryFn: () => getPostStoreInstallationSteps(params),
        staleTime: Duration.minutes(5),
        cacheTime: Duration.minutes(10),
        ...overrides,
        enabled:
            !!params.accountId &&
            !!params.shopName &&
            !!params.shopType &&
            (overrides?.enabled ?? true),
    })
}

export const useCreatePostStoreInstallationStepPure = (
    overrides?: MutationOverrides<typeof createPostStoreInstallationStep>,
) => {
    return useMutation({
        mutationFn: (
            params: Parameters<typeof createPostStoreInstallationStep>,
        ) => createPostStoreInstallationStep(...params),
        ...overrides,
    })
}

export const useUpdatePostStoreInstallationStepPure = (
    overrides?: MutationOverrides<typeof updatePostStoreInstallationStep>,
) => {
    return useMutation({
        mutationFn: (
            params: Parameters<typeof updatePostStoreInstallationStep>,
        ) => updatePostStoreInstallationStep(...params),
        ...overrides,
    })
}

export const useUpdateStepConfigurationPure = (
    overrides?: MutationOverrides<typeof updateStepConfiguration>,
) => {
    return useMutation({
        mutationFn: (params: Parameters<typeof updateStepConfiguration>) =>
            updateStepConfiguration(...params),
        ...overrides,
    })
}

export const useUpdateStepNotificationsPure = (
    overrides?: MutationOverrides<typeof updateStepNotifications>,
) => {
    return useMutation({
        mutationFn: (params: Parameters<typeof updateStepNotifications>) =>
            updateStepNotifications(...params),
        ...overrides,
    })
}
