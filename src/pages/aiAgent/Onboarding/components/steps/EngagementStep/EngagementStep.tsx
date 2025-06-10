import { FC, useState } from 'react'

import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import { OnboardingData } from 'models/aiAgent/types'
import { ConversationLauncherSettings } from 'pages/aiAgent/components/CustomerEngagementSettings/ConversationLauncherSettings'
import { ConversationStartersSettings } from 'pages/aiAgent/components/CustomerEngagementSettings/ConversationStartersSettings'
import { useGmvUsdOver30Days } from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/useGmvUsdOver30Days'
import { TriggerOnSearchSettings } from 'pages/aiAgent/components/CustomerEngagementSettings/TriggerOnSearchSettings'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import { Separator } from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import { EngagementStepConfirmationPopup } from 'pages/aiAgent/Onboarding/components/steps/EngagementStep/EngagementStepConfirmationPopup'
import GorgiasIcon from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/icons/GorgiasIcon'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding/hooks/useCheckStoreAlreadyConfigured'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {
    getGorgiasChatIntegrationsByStoreName,
    getShopifyIntegrationByShopName,
} from 'state/integrations/selectors'

import css from './EngagementStep.less'

export const EngagementStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const { shopName } = useParams<{ shopName: string }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })
    const { data } = useGetOnboardingData(shopName)
    const { mutate: doUpdateOnboardingMutation } = useUpdateOnboarding()

    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] =
        useState(false)

    const methods = useForm({
        values: {
            isSalesHelpOnSearchEnabled:
                data?.isSalesHelpOnSearchEnabled ?? true,
            isConversationStartersEnabled:
                data?.isConversationStartersEnabled ?? true,
            isAskAnythingInputEnabled: data?.isAskAnythingInputEnabled ?? true,
        },
    })

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const onNextStep = () => {
        const nextStep = validSteps[currentStep]?.step
        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step
        goToStep(previousStep)
    }

    const storeIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    const { data: gmv, isLoading: isGmvLoading } = useGmvUsdOver30Days(
        storeIntegration.id,
    )

    const gorgiasChatIntegrations = useAppSelector(
        getGorgiasChatIntegrationsByStoreName(shopName),
    )

    const primaryLanguage = getPrimaryLanguageFromChatConfig(
        gorgiasChatIntegrations?.meta,
    )

    const {
        watch,
        formState: { isDirty },
        handleSubmit,
    } = methods

    const isSalesHelpOnSearchEnabled = watch('isSalesHelpOnSearchEnabled')
    const isConversationStartersEnabled = watch('isConversationStartersEnabled')
    const isAskAnythingInputEnabled = watch('isAskAnythingInputEnabled')

    const onNextClick = (forceEnabled: boolean = false) => {
        if (!isDirty) {
            onNextStep()
            return
        }

        if (
            !isSalesHelpOnSearchEnabled &&
            !isConversationStartersEnabled &&
            !isAskAnythingInputEnabled &&
            !isConfirmationPopupOpen
        ) {
            setIsConfirmationPopupOpen(true)
            return
        }

        if (data && 'id' in data) {
            const updatedData: OnboardingData = {
                ...data,
                id: data.id,
                shopName,
                currentStepName: validSteps[currentStep]?.step,
                isConversationStartersEnabled:
                    forceEnabled || isConversationStartersEnabled,
                isAskAnythingInputEnabled:
                    forceEnabled || isAskAnythingInputEnabled,
                isSalesHelpOnSearchEnabled:
                    forceEnabled || isSalesHelpOnSearchEnabled,
            }

            doUpdateOnboardingMutation(
                { id: data.id, data: updatedData },
                {
                    onSuccess: () => {
                        setIsConfirmationPopupOpen(false)
                        onNextStep()
                    },
                },
            )
        } else {
            setIsConfirmationPopupOpen(false)
        }
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={handleSubmit(() => onNextClick())}
                onBackClick={onBackClick}
            >
                <MainTitle
                    titleBlack="Choose how to"
                    titleMagenta="engage your customers"
                />
                <Separator />
                <FormProvider {...methods}>
                    <div className={css.form}>
                        <TriggerOnSearchSettings
                            description="Send tailored messages after searches to guide shoppers and boost conversions."
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                            isOnboarding
                        />
                        <ConversationStartersSettings
                            description="Display AI-generated FAQs based on shopper intent to help them buy faster."
                            isEnabled
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                            isOnboarding
                        />
                        <ConversationLauncherSettings
                            description="Keep an input field visible to spark conversations and increase sales."
                            gmv={gmv}
                            isGmvLoading={isGmvLoading}
                            primaryLanguage={primaryLanguage}
                            isOnboarding
                        />
                    </div>
                </FormProvider>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading
                icon={<GorgiasIcon size="40%" />}
                caption="This is a sample conversation with AI Agent. It will evolve as you onboard."
            />
            {isConfirmationPopupOpen && (
                <EngagementStepConfirmationPopup
                    isOpen={isConfirmationPopupOpen}
                    onClose={() => setIsConfirmationPopupOpen(false)}
                    onTurnOff={() => onNextClick()}
                    onKeepOn={() => onNextClick(true)}
                />
            )}
        </OnboardingBody>
    )
}
