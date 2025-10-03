import { useCallback, useEffect, useMemo, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    useCreatePostStoreInstallationStepPure,
    useGetPostStoreInstallationStepsPure,
    useUpdatePostStoreInstallationStepPure,
    useUpdateStepConfigurationPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    CreatePostStoreInstallationStepPayload,
    PostStoreInstallationSteps,
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
    UpdateStepRequest,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'

import { DEFAULT_POST_ONBOARDING_STEPS } from '../components/PostOnboardingTasksSection/utils'

type UsePostOnboardingTasksSectionProps = {
    shopName: string
    shopType: string
}

export const usePostOnboardingTasksSection = ({
    shopName,
    shopType,
}: UsePostOnboardingTasksSectionProps) => {
    const accountId = useAppSelector(getCurrentAccountId)

    const [postOnboardingSteps, setPostOnboardingSteps] =
        useState<PostStoreInstallationSteps | null>(null)

    const { data, isLoading, isError } = useGetPostStoreInstallationStepsPure(
        {
            accountId,
            shopName,
            shopType,
        },
        {
            enabled: !!accountId && !!shopName && !!shopType,
            refetchOnWindowFocus: false,
        },
    )

    const { mutateAsync: updateStepConfig } = useUpdateStepConfigurationPure()
    const { mutateAsync: createPostStoreInstallationStep } =
        useCreatePostStoreInstallationStepPure()
    const { mutateAsync: updatePostStoreInstallationStep } =
        useUpdatePostStoreInstallationStepPure()

    useEffect(() => {
        if (data?.postStoreInstallationSteps) {
            const foundStep = data.postStoreInstallationSteps.find(
                (step) =>
                    step.type === PostStoreInstallationStepType.POST_ONBOARDING,
            )

            if (foundStep) {
                setPostOnboardingSteps(foundStep)
            }
        }
    }, [data])

    const updateStepLocally = useCallback(
        (
            prev: PostStoreInstallationSteps | null,
            stepData: UpdateStepRequest,
        ) => {
            if (!prev) return prev

            return {
                ...prev,
                stepsConfiguration: prev.stepsConfiguration.map((step) =>
                    step.stepName === stepData.stepName
                        ? { ...step, ...stepData }
                        : step,
                ),
            }
        },
        [],
    )

    const createPostOnboardingStep = useCallback(async () => {
        const payload: CreatePostStoreInstallationStepPayload = {
            ...DEFAULT_POST_ONBOARDING_STEPS,
            accountId,
            shopName,
            shopType,
        }

        const response = await createPostStoreInstallationStep([payload])

        if (response?.postStoreInstallationSteps) {
            setPostOnboardingSteps(response.postStoreInstallationSteps)
        }
    }, [accountId, shopName, shopType, createPostStoreInstallationStep])

    const updatePostStoreInstallation = useCallback(
        async (updateData: PostStoreInstallationSteps) => {
            if (!postOnboardingSteps) return

            await updatePostStoreInstallationStep([
                postOnboardingSteps.id,
                updateData,
            ])

            setPostOnboardingSteps(updateData)
        },
        [postOnboardingSteps, updatePostStoreInstallationStep],
    )

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

            setPostOnboardingSteps((prev) => updateStepLocally(prev, stepData))
        },
        [
            postOnboardingSteps,
            updateStepConfig,
            updatePostStoreInstallation,
            updateStepLocally,
        ],
    )

    const isStepCompleted = useCallback(
        (stepName: StepName) => {
            if (!postOnboardingSteps) return false

            const step = postOnboardingSteps.stepsConfiguration.find(
                (step) => step.stepName === stepName,
            )

            return !!step?.stepCompletedDatetime
        },
        [postOnboardingSteps],
    )

    const step = useCallback(
        (stepName: StepName) => {
            const existingStep = postOnboardingSteps?.stepsConfiguration?.find(
                (step) => step.stepName === stepName,
            )

            return existingStep
        },
        [postOnboardingSteps],
    )

    const completedStepsCount = useMemo(() => {
        if (!postOnboardingSteps) return 0

        return postOnboardingSteps.stepsConfiguration.filter(
            (step) => !!step.stepCompletedDatetime,
        ).length
    }, [postOnboardingSteps])

    return {
        isLoading,
        isError,
        postOnboardingSteps,
        step,
        isStepCompleted,
        completedStepsCount,
        updateStep,
        createPostOnboardingStep,
        updatePostStoreInstallation,
    }
}
