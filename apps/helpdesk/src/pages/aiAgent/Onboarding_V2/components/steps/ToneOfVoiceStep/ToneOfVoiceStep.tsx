import type { FC } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { ToneOfVoiceComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ToneOfVoiceComponent'
import {
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    ToneOfVoice,
} from 'pages/aiAgent/constants'
import type { ConversationMessage } from 'pages/aiAgent/Onboarding_V2/components/AiAgentChatConversation/AiAgentChatConversation'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding_V2/components/AiAgentChatConversation/AiAgentChatConversation'
import MainTitle from 'pages/aiAgent/Onboarding_V2/components/MainTitle/MainTitle'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { conversationExamples } from 'pages/aiAgent/Onboarding_V2/constants/conversationExamples'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
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
import TextArea from 'pages/common/forms/TextArea'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

import css from './ToneOfVoiceStep.less'

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
    const { shopName } = useParams<{ shopName: string }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })
    const isFirstStep = currentStep === 1

    const { data } = useGetOnboardingData(shopName)
    const { mutate: doUpdateOnboardingMutation } = useUpdateOnboarding()

    const storeIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    useCheckStoreIntegration({ shouldCheck: !isFirstStep })
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
        setValue,
        formState: { isDirty, errors },
        handleSubmit,
    } = methods

    const toneOfVoice = watch('toneOfVoice')
    const customToneOfVoiceGuidance = watch('customToneOfVoiceGuidance')

    const { previewConversation, isPreviewLoading } =
        useTransformToneOfVoiceConversations(
            storeIntegration.id,
            shopName,
            'orderReturns',
        )

    const handleToneOfVoiceChange = (selectedTone: string) => {
        setValue('toneOfVoice', selectedTone as ToneOfVoice, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const handleCustomToneOfVoiceChange = (newValue: string) => {
        setValue('customToneOfVoiceGuidance', newValue, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    const onNextClick = () => {
        if (!data || !('id' in data)) {
            return
        }

        const hasExistingToneOfVoice = !!data.toneOfVoice

        if (!isDirty && hasExistingToneOfVoice) {
            onNextStep()
            return
        }

        const updatedData = {
            ...data,
            shopName,
            currentStepName: validSteps[currentStep]?.step,
            toneOfVoice,
            customToneOfVoiceGuidance: customToneOfVoiceGuidance || undefined,
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

    const isCustomToneOfVoiceSelected = toneOfVoice === ToneOfVoice.Custom

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNextClick={handleSubmit(onNextClick)}
                    onBackClick={onBackClick}
                >
                    <MainTitle
                        titleBlack="Choose a tone that matches your brand"
                        titleMagenta=""
                        className={css.title}
                    />
                    <div className={css.description}>
                        <Text>
                            Set the personality of your AI Agent. Pick how your
                            AI Agent speaks so it feels aligned with your
                            brand&apos;s voice and values, building trust with
                            your customers.
                        </Text>
                    </div>
                    <ToneOfVoiceComponent
                        value={toneOfVoice}
                        onChange={handleToneOfVoiceChange}
                    />
                    {isCustomToneOfVoiceSelected && (
                        <div className={css.customToneOfVoiceGuidance}>
                            <TextArea
                                label="Custom tone of voice"
                                autoRowHeight
                                placeholder="Add specific instructions"
                                maxLength={CUSTOM_TONE_OF_VOICE_MAX_LENGTH}
                                value={customToneOfVoiceGuidance}
                                onChange={handleCustomToneOfVoiceChange}
                                innerClassName={css.customToneTextArea}
                                autoFocus
                                error={
                                    errors.customToneOfVoiceGuidance?.message
                                }
                            />
                            <div className={css.formInputFooterInfo}>
                                Examples: &apos;Use a friendly and
                                conversational tone&apos;, &apos;Speak casually,
                                use emojis&apos;, &apos;Be professional and
                                concise&apos;
                            </div>
                        </div>
                    )}
                </OnboardingContentContainer>
                <ToneOfVoicePreview
                    previewConversation={previewConversation}
                    isPreviewLoading={isPreviewLoading}
                />
            </OnboardingBody>
        </FormProvider>
    )
}

interface ToneOfVoicePreviewProps {
    previewConversation:
        | {
              messages: ConversationMessage[]
          }
        | undefined
    isPreviewLoading: boolean
}

const ToneOfVoicePreview: FC<ToneOfVoicePreviewProps> = ({
    previewConversation,
    isPreviewLoading,
}) => {
    const messages =
        previewConversation?.messages ||
        conversationExamples.orderReturns.messages

    return (
        <OnboardingPreviewContainer
            isLoading={isPreviewLoading}
            icon=""
            caption=""
        >
            <div className={css.chatWrapper}>
                <ChatIntegrationPreview {...chatPreviewSettings}>
                    <AiAgentChatConversation
                        {...agentChatConversationSettings}
                        messages={messages}
                        isTyping={isPreviewLoading}
                        removeLinksFromMessages
                    />
                </ChatIntegrationPreview>
            </div>
        </OnboardingPreviewContainer>
    )
}
