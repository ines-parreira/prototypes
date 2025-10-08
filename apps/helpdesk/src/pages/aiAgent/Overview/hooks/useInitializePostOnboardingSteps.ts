import { useCallback, useEffect } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetStoreConfigurationPure } from 'models/aiAgent/queries'
import {
    useCreatePostStoreInstallationStepPure,
    useGetPostStoreInstallationStepsPure,
    useUpdatePostStoreInstallationStepPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    CreatePostStoreInstallationStepPayload,
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { DEFAULT_POST_ONBOARDING_STEPS } from '../components/PostOnboardingTasksSection/utils'

export const useInitializePostOnboardingSteps = (
    shopName: string,
    shopType: string,
    enabled = true,
) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const accountId = currentAccount.get('id')

    const { data: storeConfiguration, isLoading: isStoreLoading } =
        useGetStoreConfigurationPure(
            { accountDomain, storeName: shopName },
            { retry: 1, refetchOnWindowFocus: false },
        )

    const {
        data,
        refetch,
        isLoading: isStepsLoading,
    } = useGetPostStoreInstallationStepsPure(
        { accountId, shopName, shopType },
        {
            enabled,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    )

    const { mutateAsync: createPostOnboardingStep } =
        useCreatePostStoreInstallationStepPure()
    const { mutateAsync: updatePostOnboardingStep } =
        useUpdatePostStoreInstallationStepPure()

    const postOnboardingStep = data?.postStoreInstallationSteps?.find(
        (s) => s.type === PostStoreInstallationStepType.POST_ONBOARDING,
    )

    const ensureInitialized = useCallback(async () => {
        if (postOnboardingStep) return

        const isAIAgentEnabled = storeConfiguration?.data.storeConfiguration
            ? isAiAgentEnabledForStore(
                  storeConfiguration.data.storeConfiguration,
              )
            : false

        const payload: CreatePostStoreInstallationStepPayload = {
            ...DEFAULT_POST_ONBOARDING_STEPS,
            accountId,
            shopName,
            shopType,
            status: isAIAgentEnabled
                ? PostStoreInstallationStepStatus.COMPLETED
                : PostStoreInstallationStepStatus.NOT_STARTED,
            completedDatetime: isAIAgentEnabled
                ? new Date().toISOString()
                : null,
        }

        await createPostOnboardingStep([payload])
        await refetch()
    }, [
        postOnboardingStep,
        accountId,
        shopName,
        shopType,
        storeConfiguration,
        createPostOnboardingStep,
        refetch,
    ])

    const markPostOnboardingStepAsCompleted = useCallback(async () => {
        const isAIAgentEnabled = storeConfiguration?.data.storeConfiguration
            ? isAiAgentEnabledForStore(
                  storeConfiguration.data.storeConfiguration,
              )
            : false

        if (
            !postOnboardingStep ||
            !isAIAgentEnabled ||
            postOnboardingStep.status ===
                PostStoreInstallationStepStatus.COMPLETED
        )
            return

        await updatePostOnboardingStep([
            postOnboardingStep.id,
            {
                ...postOnboardingStep,
                status: PostStoreInstallationStepStatus.COMPLETED,
                completedDatetime: new Date().toISOString(),
            },
        ])
    }, [postOnboardingStep, updatePostOnboardingStep, storeConfiguration])

    useEffect(() => {
        const shouldNotRun = !enabled || isStoreLoading || isStepsLoading
        if (shouldNotRun) return

        if (postOnboardingStep) {
            void markPostOnboardingStepAsCompleted()
            return
        }
        void ensureInitialized()
    }, [
        enabled,
        isStoreLoading,
        isStepsLoading,
        ensureInitialized,
        postOnboardingStep,
        markPostOnboardingStepAsCompleted,
    ])

    return {
        isLoading: enabled && (isStepsLoading || !postOnboardingStep),
    }
}
