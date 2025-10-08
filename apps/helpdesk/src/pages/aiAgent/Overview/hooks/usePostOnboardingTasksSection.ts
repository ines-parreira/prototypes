import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import {
    postStoreInstallationStepsKeys,
    useGetPostStoreInstallationStepsPure,
    useUpdatePostStoreInstallationStepPure,
    useUpdateStepConfigurationPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationSteps,
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
    UpdateStepRequest,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'

type UsePostOnboardingTasksSectionProps = {
    shopName: string
    shopType: string
}

/**
 * Exposes the Post Onboarding steps for a store and helpers to mutate them.
 *
 */
export const usePostOnboardingTasksSection = ({
    shopName,
    shopType,
}: UsePostOnboardingTasksSectionProps) => {
    const accountId = useAppSelector(getCurrentAccountId)
    const queryClient = useQueryClient()

    const queryEnabled = Boolean(accountId && shopName && shopType)

    // -------------------------
    // Query invalidation helper
    // -------------------------
    const onMutationSuccess = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: postStoreInstallationStepsKeys.detail({
                accountDomain: String(accountId),
                shopName,
            }),
        })
    }, [queryClient, accountId, shopName])

    // -------------------------
    // Data fetching
    // -------------------------
    const { data, isLoading, isError } = useGetPostStoreInstallationStepsPure(
        { accountId, shopName, shopType },
        {
            enabled: queryEnabled,
            refetchOnWindowFocus: false,
        },
    )

    // Mutations
    const { mutateAsync: updateStepConfig } = useUpdateStepConfigurationPure({
        onSuccess: onMutationSuccess,
    })
    const { mutateAsync: updatePostStoreInstallationStep } =
        useUpdatePostStoreInstallationStepPure({
            onSuccess: onMutationSuccess,
        })

    // -------------------------
    // Derived state from query data
    // -------------------------
    const postOnboardingSteps = useMemo(() => {
        if (!data?.postStoreInstallationSteps) return null

        return (
            data.postStoreInstallationSteps.find(
                (s) => s.type === PostStoreInstallationStepType.POST_ONBOARDING,
            ) ?? null
        )
    }, [data])

    /**
     * Persists a full PostStoreInstallationSteps object to the server.
     * Query will be invalidated automatically via onSuccess callback.
     */
    const updatePostStoreInstallation = useCallback(
        async (updateData: PostStoreInstallationSteps) => {
            if (!postOnboardingSteps) return

            await updatePostStoreInstallationStep([
                postOnboardingSteps.id,
                updateData,
            ])
        },
        [postOnboardingSteps, updatePostStoreInstallationStep],
    )

    /**
     * Updates a single step's configuration. If the overall status is NOT_STARTED,
     * moves it to IN_PROGRESS first to reflect activity.
     * Query will be invalidated automatically via onSuccess callback.
     */
    const updateStep = useCallback(
        async (stepData: UpdateStepRequest) => {
            if (!postOnboardingSteps) return

            if (
                postOnboardingSteps.status ===
                PostStoreInstallationStepStatus.NOT_STARTED
            ) {
                await updatePostStoreInstallation({
                    ...postOnboardingSteps,
                    status: PostStoreInstallationStepStatus.IN_PROGRESS,
                })
            }

            await updateStepConfig([postOnboardingSteps.id, stepData])
        },
        [postOnboardingSteps, updateStepConfig, updatePostStoreInstallation],
    )

    /**
     * Marks the entire post-installation flow as completed.
     * Query will be invalidated automatically via onSuccess callback.
     */
    const markPostStoreInstallationAsCompleted = useCallback(async () => {
        if (!postOnboardingSteps) return

        await updatePostStoreInstallation({
            ...postOnboardingSteps,
            status: PostStoreInstallationStepStatus.COMPLETED,
            completedDatetime: new Date().toISOString(),
        })
    }, [postOnboardingSteps, updatePostStoreInstallation])

    // -------------------------
    // Selectors / Derived state
    // -------------------------
    const isStepCompleted = useCallback(
        (stepName: StepName) => {
            if (!postOnboardingSteps) return false
            const found = postOnboardingSteps.stepsConfiguration.find(
                (s) => s.stepName === stepName,
            )
            return Boolean(found?.stepCompletedDatetime)
        },
        [postOnboardingSteps],
    )

    const step = useCallback(
        (stepName: StepName) =>
            postOnboardingSteps?.stepsConfiguration?.find(
                (s) => s.stepName === stepName,
            ),
        [postOnboardingSteps],
    )

    const completedStepsCount = useMemo(() => {
        if (!postOnboardingSteps) return 0
        return postOnboardingSteps.stepsConfiguration.filter((s) =>
            Boolean(s.stepCompletedDatetime),
        ).length
    }, [postOnboardingSteps])

    const firstUncompletedStepName = useMemo(() => {
        if (!postOnboardingSteps) return null
        const uncompleted = postOnboardingSteps.stepsConfiguration.find(
            (s) => !s.stepCompletedDatetime,
        )
        return uncompleted?.stepName ?? null
    }, [postOnboardingSteps])

    return {
        isLoading,
        isError,
        postOnboardingSteps,
        step,
        isStepCompleted,
        completedStepsCount,
        firstUncompletedStepName,
        updateStep,
        updatePostStoreInstallation,
        markPostStoreInstallationAsCompleted,
    }
}
