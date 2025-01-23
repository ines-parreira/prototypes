import {Label} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React, {useReducer} from 'react'

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
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import IconInput from 'pages/common/forms/input/IconInput'
import InputField from 'pages/common/forms/input/InputField'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import {
    DiscountStrategy,
    DiscountStrategyLabels,
    DiscountStrategySteps,
} from './DiscountStrategy'
import css from './PersonalityStep.less'
import {reducer} from './PersonalityStepReducer'
import {
    PersuasionLevel,
    PersuasionLevelLabels,
    PersuasionLevelSteps,
} from './PersuasionLevel'

export const PersonalityStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    // TODO: replace with an API call
    const {persuasionLevel, discountStrategy, maxDiscountPercentage} = {
        persuasionLevel: PersuasionLevel.Moderate,
        discountStrategy: DiscountStrategy.Balanced,
        maxDiscountPercentage: 8,
    }

    const [state, dispatch] = useReducer(reducer, {
        persuasionLevel: {
            value: persuasionLevel,
        },
        discountStrategy: {
            value: discountStrategy,
        },
        maxDiscountPercentage: {
            value: maxDiscountPercentage,
            disabled: discountStrategy === DiscountStrategy.NoDiscount,
        },
    })

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
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
                        <div className={css.sliderWrapper}>
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
                        </div>
                        <div className={css.cardDescriptionWrapper}>
                            <img src={sparkles} alt="Sparkles" />
                            <div>
                                {
                                    PersuasionLevelLabels[
                                        state.persuasionLevel.value
                                    ]?.description
                                }
                            </div>
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
                        </div>
                        <div className={css.cardDescriptionWrapper}>
                            <img src={sparkles} alt="Sparkles" />
                            <div>
                                {
                                    DiscountStrategyLabels[
                                        state.discountStrategy.value
                                    ]?.description
                                }
                            </div>
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
                            isDisabled={state.maxDiscountPercentage.disabled}
                        />
                    </section>
                </Card>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={false} icon={''}>
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
