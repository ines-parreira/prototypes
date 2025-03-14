import React, { useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { Label } from '@gorgias/merchant-ui-kit'

import { OnboardingData, SalesSettingsData } from 'models/aiAgent/types'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import Card from 'pages/aiAgent/Onboarding/components/Card/Card'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import { OnboardingSteppedSlider } from 'pages/aiAgent/Onboarding/components/OnboardingSteppedSlider/OnboardingSteppedSlider'
import { PreviewId } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import {
    DiscountStrategy,
    DiscountStrategyLabels,
    DiscountStrategySteps,
} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import css from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersonalityStep.less'
import {
    PersuasionLevel,
    PersuasionLevelLabels,
    PersuasionLevelSteps,
} from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetChatIntegrationColor } from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { formatDiscountMax } from 'pages/aiAgent/utils/sales-discount.utils'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import { conversationExamples } from '../PersonalityPreviewStep/conversationsExamples'

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

export const PersonalityStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const { shopName } = useParams<{ shopName: string }>()

    const { validSteps } = useSteps({ shopName, isStoreSelected })

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(shopName)
    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()

    const { mainColor, conversationColor } = useGetChatIntegrationColor({
        shopName,
        chatIntegrationIds: data?.chatIntegrationIds,
    })

    const isLoading = isLoadingOnboardingData || isUpdatingOnboarding

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()

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
        setValue,
        formState: { errors, isDirty },
        handleSubmit,
        trigger,
    } = methods

    // Watch form state values
    const salesPersuasionLevel = watch('salesPersuasionLevel')
    const salesDiscountStrategyLevel = watch('salesDiscountStrategyLevel')
    const salesDiscountMax = watch('salesDiscountMax')

    const handleSliderChange = (
        field: keyof SalesSettingsData,
        value: PersuasionLevel | DiscountStrategy | number,
    ) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true })
        if (
            field === 'salesDiscountStrategyLevel' &&
            value === DiscountStrategy.NoDiscount
        ) {
            setValue('salesDiscountMax', 0, {
                shouldValidate: true,
                shouldDirty: true,
            })
        }
        if (
            field === 'salesDiscountStrategyLevel' &&
            value !== DiscountStrategy.NoDiscount &&
            !salesDiscountMax
        ) {
            setValue('salesDiscountMax', 8, {
                shouldValidate: true,
                shouldDirty: true,
            })
        }
        if (field === 'salesDiscountStrategyLevel') {
            void trigger('salesDiscountMax')
        }
    }

    const onChangeDiscountMax = (value: string) => {
        if (value === '') {
            setValue('salesDiscountMax', value as any, {
                shouldValidate: false,
                shouldDirty: true,
            })
            return
        }

        const parsedValue = Number(value)
        setValue(
            'salesDiscountMax',
            !value || isNaN(parsedValue) ? 0 : parsedValue,
            {
                shouldValidate: true,
                shouldDirty: true,
            },
        )

        if (parsedValue === 0) {
            setValue(
                'salesDiscountStrategyLevel',
                DiscountStrategy.NoDiscount,
                {
                    shouldValidate: true,
                    shouldDirty: true,
                },
            )
            void trigger('salesDiscountMax')
        }
    }

    const onNextClick = () => {
        if (!isDirty) {
            onNextStep()
            return
        }
        if (data && 'id' in data) {
            const updatedData: OnboardingData = {
                ...data,
                id: data.id as string,
                shopName,
                currentStepName: WizardStepEnum.HANDOVER,
                salesPersuasionLevel,
                salesDiscountStrategyLevel,
                salesDiscountMax: salesDiscountMax
                    ? salesDiscountMax / 100
                    : null,
            }

            doUpdateOnboardingMutation(
                { id: data.id as string, data: updatedData },
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
        const capitalizedPersuasionLevel =
            String(salesPersuasionLevel).charAt(0).toUpperCase() +
            String(salesPersuasionLevel).slice(1)
        if (salesDiscountStrategyLevel === DiscountStrategy.NoDiscount) {
            const previewName = `noDiscount${capitalizedPersuasionLevel}`
            return conversationExamples[previewName as PreviewId].messages
        }
        const previewName = `withDiscount${capitalizedPersuasionLevel}`
        return conversationExamples[previewName as PreviewId].messages.map(
            (message) => {
                const newMessage = { ...message }
                newMessage.content = message.content.replace(
                    '[DISCOUNT-PERCENTAGE]',
                    salesDiscountMax.toString(),
                )
                return newMessage
            },
        )
    }, [salesDiscountStrategyLevel, salesPersuasionLevel, salesDiscountMax])

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNextClick={handleSubmit(onNextClick)}
                    onBackClick={onBackClick}
                >
                    <div className={css.title}>
                        <MainTitle
                            titleBlack="Let's define the sales skills for "
                            titleMagenta="your AI Agent"
                        />
                    </div>

                    <div className={css.cardsWrapper}>
                        <Card className={css.cardSection}>
                            <div className={css.cardTitleWrapper}>
                                <label
                                    htmlFor="salesPersuasionLevel"
                                    className={css.cardTitle}
                                >
                                    Set your sales persuasion level
                                </label>
                                <IconTooltip>
                                    AI Agent will take into account your custom
                                    persuasion level in the way in interacts
                                    with customers.
                                </IconTooltip>
                            </div>
                            <div className={css.steppedSlider}>
                                <OnboardingSteppedSlider
                                    steps={PersuasionLevelSteps}
                                    stepKey={salesPersuasionLevel}
                                    onChange={(value: string) => {
                                        handleSliderChange(
                                            'salesPersuasionLevel',
                                            value as PersuasionLevel,
                                        )
                                    }}
                                />
                                <AIBanner fillStyle="fill">
                                    {
                                        PersuasionLevelLabels[
                                            salesPersuasionLevel
                                        ]?.description
                                    }
                                </AIBanner>
                            </div>
                        </Card>

                        <Card className={css.cardSection}>
                            <div className={css.cardTitleWrapper}>
                                <label
                                    htmlFor="salesDiscountStrategyLevel"
                                    className={css.cardTitle}
                                >
                                    Set your discount strategy
                                </label>
                                <IconTooltip>
                                    Define how often AI Agent should use
                                    discounts to encourage customers to complete
                                    a purchase.
                                </IconTooltip>
                            </div>
                            <div>
                                <OnboardingSteppedSlider
                                    steps={DiscountStrategySteps}
                                    stepKey={salesDiscountStrategyLevel}
                                    onChange={(value: string) => {
                                        handleSliderChange(
                                            'salesDiscountStrategyLevel',
                                            value as DiscountStrategy,
                                        )
                                    }}
                                />
                                <AIBanner fillStyle="fill">
                                    {
                                        DiscountStrategyLabels[
                                            salesDiscountStrategyLevel
                                        ]?.description
                                    }
                                </AIBanner>
                            </div>
                            <hr className={css.separator} />
                            <div className={css.percentageSection}>
                                <Label htmlFor="percentage-discount">
                                    Maximum Discount Percentage
                                    <IconTooltip>
                                        Set the maximum discount that AI Agent
                                        will offer customers
                                    </IconTooltip>
                                </Label>
                                <InputField
                                    data-testid="percentage-input"
                                    type="number"
                                    min={1}
                                    max={100}
                                    id="percentage-discount"
                                    className={css.percentageInputWrapper}
                                    value={salesDiscountMax}
                                    onChange={onChangeDiscountMax}
                                    suffix={<IconInput icon="percent" />}
                                    error={errors.salesDiscountMax?.message}
                                    isDisabled={
                                        salesDiscountStrategyLevel ===
                                        DiscountStrategy.NoDiscount
                                    }
                                />
                            </div>
                        </Card>
                    </div>
                </OnboardingContentContainer>
                <OnboardingPreviewContainer
                    isLoading={isLoading}
                    icon={''}
                    caption="This is a sample conversation with AI Agent. It will evolve as you onboard."
                >
                    <div className={css.chatWrapper}>
                        <ChatIntegrationPreview
                            {...{
                                ...chatPreviewSettings,
                                mainColor:
                                    mainColor ?? chatPreviewSettings.mainColor,
                            }}
                        >
                            <AiAgentChatConversation
                                {...{
                                    ...agentChatConversationSettings,
                                    conversationColor:
                                        conversationColor ??
                                        agentChatConversationSettings.conversationColor,
                                }}
                                messages={preview}
                                removeLinksFromMessages
                            />
                        </ChatIntegrationPreview>
                    </div>
                </OnboardingPreviewContainer>
            </OnboardingBody>
        </FormProvider>
    )
}
