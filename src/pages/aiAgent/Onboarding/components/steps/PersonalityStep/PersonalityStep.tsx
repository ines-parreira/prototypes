import {Label} from '@gorgias/merchant-ui-kit'
import {zodResolver} from '@hookform/resolvers/zod'
import cn from 'classnames'
import React from 'react'

import {FormProvider, useForm} from 'react-hook-form'
import {z} from 'zod'

import sparkles from 'assets/img/icons/auto_awesome.svg'

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
import {
    useGetOnboardingData,
    useUpdateOnboardingCache,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
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
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

type PersonalityFormValues = {
    persuasionLevel: PersuasionLevel
    discountStrategy: DiscountStrategy
    maxDiscountPercentage: number
}

const personalitySchema = z
    .object({
        persuasionLevel: z.nativeEnum(PersuasionLevel),
        discountStrategy: z.nativeEnum(DiscountStrategy),
        maxDiscountPercentage: z.number().optional(), // Initially optional
    })
    .refine(
        (data) => {
            if (data.discountStrategy === DiscountStrategy.NoDiscount) {
                // Allow only 0 when discount strategy is NoDiscount
                return data.maxDiscountPercentage === 0
            }
            // Enforce range 1-100 for other discount strategies
            return (
                data.maxDiscountPercentage !== undefined &&
                data.maxDiscountPercentage >= 1 &&
                data.maxDiscountPercentage <= 100
            )
        },
        {
            message: 'Must be a number between 1 and 100',
            path: ['maxDiscountPercentage'],
        }
    )

export const PersonalityStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    setCurrentStep,
}) => {
    const {isLoading, data} = useGetOnboardingData()

    const storeName = data?.shop || ''

    useCheckStoreIntegration({storeName, isLoading, setCurrentStep})

    const updateOnboardingCache = useUpdateOnboardingCache()

    const methods = useForm<PersonalityFormValues>({
        values: {
            persuasionLevel: data?.persuasionLevel ?? PersuasionLevel.Moderate,
            discountStrategy:
                data?.discountStrategy ?? DiscountStrategy.Balanced,
            maxDiscountPercentage: data?.maxDiscountPercentage ?? 8,
        },
        mode: 'onChange',
        resolver: zodResolver(personalitySchema),
    })

    const {
        watch,
        setValue,
        formState: {errors},
        handleSubmit,
        trigger,
    } = methods

    // Watch form state values
    const persuasionLevel = watch('persuasionLevel')
    const discountStrategy = watch('discountStrategy')
    const maxDiscountPercentage = watch('maxDiscountPercentage')

    const updateCacheData = () => {
        updateOnboardingCache('persuasionLevel', persuasionLevel)
        updateOnboardingCache('discountStrategy', discountStrategy)
        updateOnboardingCache('maxDiscountPercentage', maxDiscountPercentage)
    }

    const handleSliderChange = (
        field: keyof PersonalityFormValues,
        value: PersuasionLevel | DiscountStrategy | number
    ) => {
        setValue(field, value, {shouldValidate: true})
        if (
            field === 'discountStrategy' &&
            value === DiscountStrategy.NoDiscount
        ) {
            setValue('maxDiscountPercentage', 0, {shouldValidate: true})
        }
        if (field === 'discountStrategy') {
            void trigger('maxDiscountPercentage')
        }
    }

    const onNextClick = () => {
        updateCacheData()
        setCurrentStep?.(WizardStepEnum.HANDOVER)
    }

    const onBackClick = () => {
        updateCacheData()
        setCurrentStep?.(WizardStepEnum.PERSONALITY_PREVIEW)
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
                                {!persuasionLevel ? (
                                    <Skeleton height={50} />
                                ) : (
                                    <OnboardingSteppedSlider
                                        steps={PersuasionLevelSteps}
                                        stepKey={persuasionLevel}
                                        onChange={(value: string) => {
                                            handleSliderChange(
                                                'persuasionLevel',
                                                value as PersuasionLevel
                                            )
                                        }}
                                    />
                                )}
                            </div>
                            <div className={css.cardDescriptionWrapper}>
                                <img src={sparkles} alt="Sparkles" />
                                {!persuasionLevel ? (
                                    <Skeleton />
                                ) : (
                                    <div>
                                        {
                                            PersuasionLevelLabels[
                                                persuasionLevel
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
                                {!discountStrategy ? (
                                    <Skeleton height={50} />
                                ) : (
                                    <OnboardingSteppedSlider
                                        steps={DiscountStrategySteps}
                                        stepKey={discountStrategy}
                                        onChange={(value: string) => {
                                            handleSliderChange(
                                                'discountStrategy',
                                                value as DiscountStrategy
                                            )
                                        }}
                                    />
                                )}
                            </div>
                            <div className={css.cardDescriptionWrapper}>
                                <img src={sparkles} alt="Sparkles" />
                                {!discountStrategy ? (
                                    <Skeleton />
                                ) : (
                                    <div>
                                        {
                                            DiscountStrategyLabels[
                                                discountStrategy
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
                                value={maxDiscountPercentage}
                                onChange={(value: string) => {
                                    const parsedValue = Number(value)
                                    setValue(
                                        'maxDiscountPercentage',
                                        !value || isNaN(parsedValue)
                                            ? 0
                                            : parsedValue,
                                        {shouldValidate: true}
                                    )
                                }}
                                suffix={<IconInput icon="percent" />}
                                error={errors.maxDiscountPercentage?.message}
                                isDisabled={
                                    discountStrategy ===
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
