import { useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router-dom'

import { Skeleton } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    storeConfigurationKeys,
    useStartSalesTrialMutation,
} from 'models/aiAgent/queries'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { Card, CardContent } from 'pages/aiAgent/Onboarding/components/Card'
import KnowledgePreview from 'pages/aiAgent/Onboarding/components/KnowledgePreview/KnowledgePreview'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import GorgiasIcon from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/icons/GorgiasIcon'
import { KnowledgeResourceLine } from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeResourceLine'
import css from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep.less'
import {
    KnowledgeSourceType,
    KnowledgeStatus,
    StepProps,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding/hooks/useCheckStoreAlreadyConfigured'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetKnowledgeSourceStatuses } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeSourceStatuses'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const KnowledgeStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    const { shopName } = useParams<{ shopName: string }>()

    const { validSteps } = useSteps({ shopName, isStoreSelected })

    const { data } = useGetOnboardingData(shopName)

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const { mutate: doUpdateOnboardingMutation } = useUpdateOnboarding()
    const queryClient = useQueryClient()

    const { routes } = useAiAgentNavigation({ shopName })

    const { knowledgeSources, helpCenters } =
        useGetKnowledgeSourceStatuses(shopName)

    const trialAccess = useTrialAccess(shopName)
    const [shoppingAssistantTrialOptin, , removeShoppingAssistantTrialOptin] =
        useLocalStorage<boolean>(
            `${shopName}-shopping-assistant-trial-optin`,
            false,
        )
    const { mutateAsync: startShoppingAssistantTrial } =
        useStartSalesTrialMutation({
            onError: () => {
                dispatch(
                    notify({
                        message:
                            'Failed to start the Shopping Assistant trial. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )
            },
        })

    const nextPath = !!isAiAgentExpandingTrialExperienceForAllEnabled
        ? routes.perShopOverview
        : routes.overview

    const onNextClick = async () => {
        if (data && 'id' in data) {
            setIsLoading(true)
            try {
                doUpdateOnboardingMutation(
                    {
                        id: data.id,
                        data: {
                            ...data,
                            id: data.id,
                            completedDatetime: new Date().toISOString(),
                            faqHelpCenterId: helpCenters[0]?.id ?? null,
                        },
                    },
                    {
                        onSuccess: async () => {
                            void queryClient.invalidateQueries({
                                queryKey: storeConfigurationKeys.all(),
                            })

                            if (
                                trialAccess.trialType ===
                                    TrialType.ShoppingAssistant &&
                                shoppingAssistantTrialOptin
                            ) {
                                await startShoppingAssistantTrial([shopName])
                                removeShoppingAssistantTrialOptin()
                            }

                            logEvent(
                                SegmentEvent.AiAgentNewOnboardingWizardFinished,
                                {
                                    shopName,
                                },
                            )
                            history.push({
                                pathname: nextPath,
                                search: `?shopName=${encodeURIComponent(shopName)}&from=onboarding`,
                            })
                        },
                        onError: () => {
                            setIsLoading(false)
                        },
                    },
                )
            } catch {
                setIsLoading(false)
            }
        }
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    const renderContent = () => (
        <div className={css.knowledgeResources}>
            {Object.entries(knowledgeSources).map(([type, knowledgeSource]) => {
                if (!knowledgeSource) return undefined

                const { isLoading, label, status } = knowledgeSource
                return isLoading ? (
                    <Skeleton key={type} height={24} />
                ) : (
                    <KnowledgeResourceLine
                        key={type}
                        name={label}
                        type={type as KnowledgeSourceType}
                        isReady={status === KnowledgeStatus.DONE}
                    />
                )
            })}
        </div>
    )

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
                isLoading={isLoading}
            >
                <MainTitle
                    titleBlack="Great, start building "
                    titleMagenta="AI Agent's knowledge"
                />
                <div className={css.banner}>
                    <AIBanner fillStyle="fill">
                        Your AI Agent leverages different knowledge resources to
                        provide accurate responses to customers. You can update
                        or expand your knowledge resources anytime in your
                        settings.
                    </AIBanner>
                </div>
                <Card className={css.card}>
                    <CardContent>{renderContent()}</CardContent>
                </Card>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={false}
                icon={<GorgiasIcon size="40%" />}
            >
                <KnowledgePreview shopName={shopName} />
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
