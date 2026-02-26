import type { FC } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import useAppSelector from 'hooks/useAppSelector'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import useCustomToneOfVoicePreview from 'pages/aiAgent/hooks/useCustomToneOfVoicePreview'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import { useCheckStoreIntegration } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useCreateOnboarding'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { useTrackFieldValue } from 'pages/aiAgent/Onboarding_V2/hooks/useTrackFieldValue'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import { getCurrentDomain } from 'state/currentAccount/selectors'

import { ToneOfVoiceFormSection } from './components/ToneOfVoiceFormSection'
import { ToneOfVoicePreviewSection } from './components/ToneOfVoicePreviewSection'

const toneOfVoiceSchema = z
    .object({
        toneOfVoice: z.nativeEnum(ToneOfVoice),
        customToneOfVoiceGuidance: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.toneOfVoice === ToneOfVoice.Custom) {
                return (
                    data.customToneOfVoiceGuidance &&
                    data.customToneOfVoiceGuidance.trim().length > 0
                )
            }
            return true
        },
        {
            message: 'Custom tone of voice guidance is required',
            path: ['customToneOfVoiceGuidance'],
        },
    )

type ToneOfVoiceFormData = z.infer<typeof toneOfVoiceSchema>

export const ToneOfVoiceStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const { shopName, step: stepName } = useParams<{
        shopName: string
        step: string
    }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })
    const isFirstStep = currentStep === 1

    const { data } = useGetOnboardingData(shopName)
    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()
    const {
        mutate: doCreateOnboardingMutation,
        isLoading: isCreatingOnboarding,
    } = useCreateOnboarding()

    const gorgiasDomain = useAppSelector(getCurrentDomain)
    const scopes = useAiAgentScopesForAutomationPlan(shopName)

    useCheckStoreIntegration(!isFirstStep)
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const getToneOfVoice = (value: string | undefined): ToneOfVoice => {
        const result = z.nativeEnum(ToneOfVoice).safeParse(value)
        return result.success ? result.data : ToneOfVoice.Friendly
    }

    const methods = useForm<ToneOfVoiceFormData>({
        values: {
            toneOfVoice: getToneOfVoice(data?.toneOfVoice),
            customToneOfVoiceGuidance:
                data?.customToneOfVoiceGuidance || undefined,
        },
        mode: 'onChange',
        resolver: zodResolver(toneOfVoiceSchema),
    })

    const {
        watch,
        formState: { isDirty },
        handleSubmit,
    } = methods

    const toneOfVoice = watch('toneOfVoice')
    const customToneOfVoiceGuidance = watch('customToneOfVoiceGuidance')

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'toneOfVoice',
        fieldType: 'select',
        fieldValue: toneOfVoice,
    })

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'customToneOfVoiceGuidance',
        fieldType: 'textarea',
        fieldValue: customToneOfVoiceGuidance,
        debounceMs: 1000,
    })

    const {
        latestCustomToneOfVoicePreview,
        onGenerateCustomToneOfVoicePreview,
        isLoading: isCustomToneOfVoicePreviewLoading,
        isError: isCustomToneOfVoicePreviewError,
    } = useCustomToneOfVoicePreview({
        customToneOfVoice: customToneOfVoiceGuidance ?? '',
        shopName,
    })

    const isLoading = isUpdatingOnboarding || isCreatingOnboarding

    const onNextClick = () => {
        if (!data) {
            return
        }

        const hasExistingToneOfVoice = !!data.toneOfVoice
        const isUpdateStatus = 'id' in data

        if (!isDirty && hasExistingToneOfVoice && isUpdateStatus) {
            onNextStep()
            return
        }

        const updatedData = {
            ...data,
            shopName,
            scopes,
            gorgiasDomain,
            currentStepName: validSteps[currentStep]?.step,
            toneOfVoice,
            customToneOfVoiceGuidance,
        }

        const mutationOptions = { onSuccess: onNextStep }

        if (isUpdateStatus) {
            doUpdateOnboardingMutation(
                { id: data.id, data: updatedData },
                mutationOptions,
            )
        } else {
            doCreateOnboardingMutation(updatedData, mutationOptions)
        }
    }

    const onNextStep = () => {
        const nextStep = validSteps[currentStep]?.step
        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step
        if (previousStep) {
            goToStep(previousStep)
        }
    }

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    isLoading={isLoading}
                    onNextClick={handleSubmit(onNextClick)}
                    onBackClick={onBackClick}
                >
                    <ToneOfVoiceFormSection
                        onGeneratePreview={onGenerateCustomToneOfVoicePreview}
                        isGeneratingPreview={isCustomToneOfVoicePreviewLoading}
                        isPreviewError={isCustomToneOfVoicePreviewError}
                    />
                </OnboardingContentContainer>
                <ToneOfVoicePreviewSection
                    toneOfVoice={toneOfVoice}
                    latestCustomToneOfVoicePreview={
                        latestCustomToneOfVoicePreview
                    }
                    isCustomToneOfVoicePreviewLoading={
                        isCustomToneOfVoicePreviewLoading
                    }
                />
            </OnboardingBody>
        </FormProvider>
    )
}
