import {Label} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React, {useCallback, useEffect, useReducer} from 'react'

import sparkles from 'assets/img/icons/auto_awesome.svg'

import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import Card from 'pages/aiAgent/Onboarding/components/Card/Card'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {OnboardingSteppedSlider} from 'pages/aiAgent/Onboarding/components/OnboardingSteppedSlider/OnboardingSteppedSlider'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import {DiscountStrategyLabels, DiscountStrategySteps} from './DiscountStrategy'
import css from './PersonalityStep.less'
import {reducer} from './PersonalityStepReducer'
import {PersuasionLevelLabels, PersuasionLevelSteps} from './PersuasionLevel'

export const PersonalityStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {setOnboardingData, getOnboardingData} = useOnboardingContext()
    const {isLoading, data} = getOnboardingData()
    const [state, dispatch] = useReducer(reducer, {
        isLoading,
    })

    useEffect(() => {
        if (!isLoading && data && state.isLoading) {
            dispatch({type: 'DATA_FETCHED', data})
        }
    }, [isLoading, data, state.isLoading])

    const onNextClickWithValidation = useCallback(() => {
        const persuasionLevelValid =
            !state.persuasionLevel?.error && !!state.persuasionLevel?.value
        const discountStrategyValue =
            !state.discountStrategy?.error && !!state.discountStrategy?.value
        const maxDiscountPercentage =
            !state.maxDiscountPercentage?.error &&
            // We must compare with undefined because maxDiscountPercentage can be 0
            !!state.maxDiscountPercentage?.value !== undefined

        if (
            !persuasionLevelValid ||
            !discountStrategyValue ||
            !maxDiscountPercentage
        ) {
            return
        }

        setOnboardingData({
            persuasionLevel: state.persuasionLevel?.value,
            discountStrategy: state.discountStrategy?.value,
            maxDiscountPercentage: state.maxDiscountPercentage?.value,
        })
        onNextClick()
    }, [setOnboardingData, state, onNextClick])

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClickWithValidation}
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
                                persuasion level in the way in interacts with
                                customers.
                            </IconTooltip>
                        </div>
                        <div className={css.cardSliderWrapper}>
                            {!state.persuasionLevel ? (
                                <Skeleton height={50} />
                            ) : (
                                <OnboardingSteppedSlider
                                    steps={PersuasionLevelSteps}
                                    stepKey={state.persuasionLevel.value}
                                    onChange={(value: string) =>
                                        dispatch({
                                            type: 'UPDATE_PERSUASION_LEVEL',
                                            value,
                                        })
                                    }
                                />
                            )}
                        </div>
                        <div className={css.cardDescriptionWrapper}>
                            <img src={sparkles} alt="Sparkles" />
                            {!state.persuasionLevel ? (
                                <Skeleton />
                            ) : (
                                <div>
                                    {
                                        PersuasionLevelLabels[
                                            state.persuasionLevel.value
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
                                Define how often AI Agent should use discounts
                                to encourage customers to complete a purchase.
                            </IconTooltip>
                        </div>
                        <div className={css.cardSliderWrapper}>
                            {!state.discountStrategy ? (
                                <Skeleton height={50} />
                            ) : (
                                <OnboardingSteppedSlider
                                    steps={DiscountStrategySteps}
                                    stepKey={state.discountStrategy.value}
                                    onChange={(value: string) =>
                                        dispatch({
                                            type: 'UPDATE_DISCOUNT_STRATEGY',
                                            value,
                                        })
                                    }
                                />
                            )}
                        </div>
                        <div className={css.cardDescriptionWrapper}>
                            <img src={sparkles} alt="Sparkles" />
                            {!state.discountStrategy ? (
                                <Skeleton />
                            ) : (
                                <div>
                                    {
                                        DiscountStrategyLabels[
                                            state.discountStrategy.value
                                        ]?.description
                                    }
                                </div>
                            )}
                        </div>
                    </section>
                    <hr className={css.separator} />
                    <section
                        className={cn(css.cardSection, css.percentageSection)}
                    >
                        <Label
                            className={css.cardTitle}
                            htmlFor="percentage-discount"
                        >
                            Maximum Discount Percentage
                            <p className={css.cardSubtitle}>
                                Set the maximum offer for first-time customers
                            </p>
                        </Label>
                        {!state.maxDiscountPercentage ? (
                            <div className={css.percentageInputWrapper}>
                                <Skeleton height={30} />
                            </div>
                        ) : (
                            <InputField
                                type="number"
                                min={1}
                                max={100}
                                id="percentage-discount"
                                className={css.percentageInputWrapper}
                                value={state.maxDiscountPercentage.value}
                                onChange={(value: string) =>
                                    dispatch({
                                        type: 'UPDATE_MAX_DISCOUNT_PERCENTAGE',
                                        value,
                                    })
                                }
                                suffix={<IconInput icon="percent" />}
                                error={state.maxDiscountPercentage.error}
                                isDisabled={
                                    state.maxDiscountPercentage.disabled
                                }
                            />
                        )}
                    </section>
                </Card>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={state.isLoading} icon={''}>
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
    )
}
