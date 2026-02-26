import type { FC } from 'react'
import { useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { Box } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { OnboardingData, SalesSettingsData } from 'models/aiAgent/types'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding_V2/components/AiAgentChatConversation/AiAgentChatConversation'
import { StepHeader } from 'pages/aiAgent/Onboarding_V2/components/StepHeader/StepHeader'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { DiscountStrategySection } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategySection'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { PurchaseGuidanceSection } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PurchaseGuidanceSection'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import type { PreviewId } from 'pages/aiAgent/Onboarding_V2/constants/previewConstants'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { useTrackFieldValue } from 'pages/aiAgent/Onboarding_V2/hooks/useTrackFieldValue'
import { useTransformToneOfVoiceConversations } from 'pages/aiAgent/Onboarding_V2/hooks/useTransformToneOfVoiceConversations'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding_V2/settings'
import { formatDiscountMax } from 'pages/aiAgent/utils/sales-discount.utils'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

const personalitySchema = z
    .object({
        salesPersuasionLevel: z.nativeEnum(PersuasionLevel),
        salesDiscountStrategyLevel: z.nativeEnum(DiscountStrategy),
        salesDiscountMax: z.number().optional(),
    })
    .refine(
        (data) => {
            if (
                data.salesDiscountStrategyLevel === DiscountStrategy.NoDiscount
            ) {
                // Allow only 0 when discount strategy is NoDiscount
                return data.salesDiscountMax === 0
            }
            // Enforce range 1-100 for other discount strategies
            return (
                data.salesDiscountMax !== undefined &&
                data.salesDiscountMax >= 1 &&
                data.salesDiscountMax <= 100
            )
        },
        {
            message: 'Must be a number between 1 and 100',
            path: ['salesDiscountMax'],
        },
    )

const getPreviewId = (
    salesPersuasionLevel: PersuasionLevel,
    salesDiscountStrategyLevel: DiscountStrategy,
) => {
    const capitalizedPersuasionLevel =
        String(salesPersuasionLevel).charAt(0).toUpperCase() +
        String(salesPersuasionLevel).slice(1)
    if (salesDiscountStrategyLevel === DiscountStrategy.NoDiscount) {
        return `noDiscount${capitalizedPersuasionLevel}` as PreviewId
    }
    return `withDiscount${capitalizedPersuasionLevel}` as PreviewId
}

export const PersonalityStep: FC<StepProps> = ({
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

    const { data } = useGetOnboardingData(shopName)
    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()

    const storeIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const methods = useForm<SalesSettingsData>({
        values: {
            salesPersuasionLevel:
                data?.salesPersuasionLevel ?? PersuasionLevel.Moderate,
            salesDiscountStrategyLevel:
                data?.salesDiscountStrategyLevel ?? DiscountStrategy.Balanced,
            salesDiscountMax: formatDiscountMax(
                (data?.salesDiscountStrategyLevel ===
                DiscountStrategy.NoDiscount
                    ? 0
                    : (data?.salesDiscountMax ?? 0.08)) * 100,
            ),
        },
        mode: 'onChange',
        resolver: zodResolver(personalitySchema),
    })

    const {
        watch,
        formState: { isDirty },
        handleSubmit,
    } = methods

    const salesPersuasionLevel = watch('salesPersuasionLevel')
    const salesDiscountStrategyLevel = watch('salesDiscountStrategyLevel')
    const salesDiscountMax = watch('salesDiscountMax')

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'salesPersuasionLevel',
        fieldType: 'slider',
        fieldValue: salesPersuasionLevel,
        debounceMs: 1000,
    })

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'salesDiscountStrategyLevel',
        fieldType: 'slider',
        fieldValue: salesDiscountStrategyLevel,
        debounceMs: 1000,
    })

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'salesDiscountMax',
        fieldType: 'input',
        fieldValue: salesDiscountMax,
        debounceMs: 1000,
    })

    const { previewConversation, isPreviewLoading } =
        useTransformToneOfVoiceConversations(
            storeIntegration.id,
            shopName,
            getPreviewId(salesPersuasionLevel, salesDiscountStrategyLevel),
        )

    const onNextClick = () => {
        const hasExistingSalesSettings =
            !!data?.salesPersuasionLevel &&
            !!data?.salesDiscountStrategyLevel &&
            data?.salesDiscountMax !== null

        if (!isDirty && hasExistingSalesSettings) {
            onNextStep()
            return
        }

        if (data && 'id' in data) {
            const updatedData: OnboardingData = {
                ...data,
                id: data.id,
                shopName,
                currentStepName: validSteps[currentStep]?.step,
                salesPersuasionLevel,
                salesDiscountStrategyLevel,
                salesDiscountMax: salesDiscountMax
                    ? salesDiscountMax / 100
                    : null,
            }

            doUpdateOnboardingMutation(
                { id: data.id, data: updatedData },
                {
                    onSuccess: () => {
                        onNextStep()
                    },
                },
            )
        }
    }

    const onNextStep = () => {
        const nextStep = validSteps[currentStep]?.step

        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    const preview = useMemo(() => {
        return (previewConversation?.messages || []).map((message) => {
            const newMessage = { ...message }
            newMessage.content = message.content.replace(
                '[DISCOUNT-PERCENTAGE]',
                salesDiscountMax.toString(),
            )
            return newMessage
        })
    }, [salesDiscountMax, previewConversation])

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    isLoading={isUpdatingOnboarding}
                    onNextClick={handleSubmit(onNextClick)}
                    onBackClick={onBackClick}
                >
                    <StepHeader
                        title="Choose how AI Agent drives sales"
                        subtitle="Control how AI guides shoppers toward a purchase and uses discounts to boost sales. You can always update these settings later."
                    />
                    <Box width="100%" flexDirection="column" gap="md">
                        <PurchaseGuidanceSection />
                        <DiscountStrategySection />
                    </Box>
                </OnboardingContentContainer>
                <OnboardingPreviewContainer showCaption>
                    <Box
                        justifyContent="center"
                        alignItems="center"
                        width="100%"
                        height="100%"
                    >
                        <ChatIntegrationPreview {...chatPreviewSettings}>
                            <AiAgentChatConversation
                                {...agentChatConversationSettings}
                                messages={preview}
                                isTyping={isPreviewLoading}
                                removeLinksFromMessages
                            />
                        </ChatIntegrationPreview>
                    </Box>
                </OnboardingPreviewContainer>
            </OnboardingBody>
        </FormProvider>
    )
}
