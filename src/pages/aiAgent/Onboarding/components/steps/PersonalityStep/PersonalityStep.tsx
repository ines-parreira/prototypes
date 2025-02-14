import {Label, Skeleton} from '@gorgias/merchant-ui-kit'
import {zodResolver} from '@hookform/resolvers/zod'
import cn from 'classnames'
import React from 'react'

import {FormProvider, useForm} from 'react-hook-form'
import {useParams} from 'react-router-dom'
import {z} from 'zod'

import sparkles from 'assets/img/icons/auto_awesome.svg'

import {OnboardingData} from 'models/aiAgent/types'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import Card from 'pages/aiAgent/Onboarding/components/Card/Card'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {OnboardingSteppedSlider} from 'pages/aiAgent/Onboarding/components/OnboardingSteppedSlider/OnboardingSteppedSlider'
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
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {useUpdateOnboarding} from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

type PersonalityFormValues = {
    salesPersuasionLevel: PersuasionLevel
    salesDiscountStrategyLevel: DiscountStrategy
    salesDiscountMax: number
}

const formatDiscountMax = (value: number): number => {
    return parseFloat(value.toFixed(8).replace(/\.?0+$/, ''))
}

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
        }
    )

export const PersonalityStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const {shopName} = useParams<{shopName: string}>()

    const {data, isLoading: isLoadingOnboardingData} =
        useGetOnboardingData(shopName)
    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()

    const isLoading = isLoadingOnboardingData || isUpdatingOnboarding

    useCheckStoreIntegration()

    const methods = useForm<PersonalityFormValues>({
        values: {
            salesPersuasionLevel:
                data?.salesPersuasionLevel ?? PersuasionLevel.Moderate,
            salesDiscountStrategyLevel:
                data?.salesDiscountStrategyLevel ?? DiscountStrategy.Balanced,
            salesDiscountMax: formatDiscountMax(
                (data?.salesDiscountMax ?? 0) * 100
            ),
        },
        mode: 'onChange',
        resolver: zodResolver(personalitySchema),
    })

    const {
        watch,
        setValue,
        formState: {errors, isDirty},
        handleSubmit,
        trigger,
    } = methods

    // Watch form state values
    const salesPersuasionLevel = watch('salesPersuasionLevel')
    const salesDiscountStrategyLevel = watch('salesDiscountStrategyLevel')
    const salesDiscountMax = watch('salesDiscountMax')

    const handleSliderChange = (
        field: keyof PersonalityFormValues,
        value: PersuasionLevel | DiscountStrategy | number
    ) => {
        setValue(field, value, {shouldValidate: true, shouldDirty: true})
        if (
            field === 'salesDiscountStrategyLevel' &&
            value === DiscountStrategy.NoDiscount
        ) {
            setValue('salesDiscountMax', 0, {
                shouldValidate: true,
                shouldDirty: true,
            })
        }
        if (field === 'salesDiscountStrategyLevel') {
            void trigger('salesDiscountMax')
        }
    }

    const onNextClick = () => {
        if (!isDirty) {
            goToStep(WizardStepEnum.HANDOVER)
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
                {id: data.id as string, data: updatedData},
                {
                    onSuccess: () => {
                        goToStep(WizardStepEnum.HANDOVER)
                    },
                }
            )
        }
    }

    const onBackClick = () => {
        goToStep(WizardStepEnum.PERSONALITY_PREVIEW)
    }

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

                    <Card className={css.card}>
                        <section className={css.cardSection}>
                            <div className={css.cardTitleWrapper}>
                                <Label className={css.cardTitle}>
                                    Set your sales persuasion level
                                </Label>
                                <IconTooltip>
                                    AI Agent will take into account your custom
                                    persuasion level in the way in interacts
                                    with customers.
                                </IconTooltip>
                            </div>
                            <div className={css.cardSliderWrapper}>
                                {!salesPersuasionLevel ? (
                                    <Skeleton height={50} />
                                ) : (
                                    <OnboardingSteppedSlider
                                        steps={PersuasionLevelSteps}
                                        stepKey={salesPersuasionLevel}
                                        onChange={(value: string) => {
                                            handleSliderChange(
                                                'salesPersuasionLevel',
                                                value as PersuasionLevel
                                            )
                                        }}
                                    />
                                )}
                            </div>
                            <div className={css.cardDescriptionWrapper}>
                                <img src={sparkles} alt="Sparkles" />
                                {!salesPersuasionLevel ? (
                                    <Skeleton />
                                ) : (
                                    <div>
                                        {
                                            PersuasionLevelLabels[
                                                salesPersuasionLevel
                                            ]?.description
                                        }
                                    </div>
                                )}
                            </div>
                        </section>
                    </Card>

                    <Card className={css.card}>
                        <section className={css.cardSection}>
                            <div className={css.cardTitleWrapper}>
                                <Label className={css.cardTitle}>
                                    Set your discount strategy
                                </Label>
                                <IconTooltip>
                                    Define how often AI Agent should use
                                    discounts to encourage customers to complete
                                    a purchase.
                                </IconTooltip>
                            </div>
                            <div className={css.cardSliderWrapper}>
                                {!salesDiscountStrategyLevel ? (
                                    <Skeleton height={50} />
                                ) : (
                                    <OnboardingSteppedSlider
                                        steps={DiscountStrategySteps}
                                        stepKey={salesDiscountStrategyLevel}
                                        onChange={(value: string) => {
                                            handleSliderChange(
                                                'salesDiscountStrategyLevel',
                                                value as DiscountStrategy
                                            )
                                        }}
                                    />
                                )}
                            </div>
                            <div className={css.cardDescriptionWrapper}>
                                <img src={sparkles} alt="Sparkles" />
                                {!salesDiscountStrategyLevel ? (
                                    <Skeleton />
                                ) : (
                                    <div>
                                        {
                                            DiscountStrategyLabels[
                                                salesDiscountStrategyLevel
                                            ]?.description
                                        }
                                    </div>
                                )}
                            </div>
                        </section>
                        <hr className={css.separator} />
                        <section
                            className={cn(
                                css.cardSection,
                                css.percentageSection
                            )}
                        >
                            <Label
                                className={css.cardTitle}
                                htmlFor="percentage-discount"
                            >
                                Maximum Discount Percentage
                                <p className={css.cardSubtitle}>
                                    Set the maximum offer for first-time
                                    customers
                                </p>
                            </Label>
                            <InputField
                                data-testid="percentage-input"
                                type="number"
                                min={1}
                                max={100}
                                id="percentage-discount"
                                className={css.percentageInputWrapper}
                                value={salesDiscountMax}
                                onChange={(value: string) => {
                                    const parsedValue = Number(value)
                                    setValue(
                                        'salesDiscountMax',
                                        !value || isNaN(parsedValue)
                                            ? 0
                                            : parsedValue,
                                        {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        }
                                    )
                                }}
                                suffix={<IconInput icon="percent" />}
                                error={errors.salesDiscountMax?.message}
                                isDisabled={
                                    salesDiscountStrategyLevel ===
                                    DiscountStrategy.NoDiscount
                                }
                            />
                        </section>
                    </Card>
                </OnboardingContentContainer>
                <OnboardingPreviewContainer isLoading={isLoading} icon={''}>
                    <div className={css.chatWrapper}>
                        <ChatIntegrationPreview {...chatPreviewSettings}>
                            <AiAgentChatConversation
                                {...agentChatConversationSettings}
                            />
                        </ChatIntegrationPreview>
                        <div className={css.chatFooter}>
                            This is a sample conversation with AI Agent. It will
                            evolve as you onboard.
                        </div>
                    </div>
                </OnboardingPreviewContainer>
            </OnboardingBody>
        </FormProvider>
    )
}
