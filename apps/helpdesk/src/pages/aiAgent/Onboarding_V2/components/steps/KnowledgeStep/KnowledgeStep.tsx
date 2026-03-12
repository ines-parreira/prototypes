import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { getMomentUtcISOString } from '@repo/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router-dom'

import {
    Box,
    Icon,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    storeConfigurationKeys,
    useStartSalesTrialMutation,
} from 'models/aiAgent/queries'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { KnowledgePreview } from 'pages/aiAgent/Onboarding_V2/components/KnowledgePreview/KnowledgePreview'
import { StepHeader } from 'pages/aiAgent/Onboarding_V2/components/StepHeader/StepHeader'
import { KnowledgeResourceLine } from 'pages/aiAgent/Onboarding_V2/components/steps/KnowledgeStep/KnowledgeResourceLine'
import css from 'pages/aiAgent/Onboarding_V2/components/steps/KnowledgeStep/KnowledgeStep.less'
import type {
    KnowledgeSourceType,
    StepProps,
} from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { KnowledgeStatus } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import { useCheckStoreIntegration } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration'
import { useGetKnowledgeSourceStatuses } from 'pages/aiAgent/Onboarding_V2/hooks/useGetKnowledgeSourceStatuses'
import type { KnowledgeSourceStatuses } from 'pages/aiAgent/Onboarding_V2/hooks/useGetKnowledgeSourceStatuses'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
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

    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    const { shopName } = useParams<{ shopName: string }>()

    const { validSteps } = useSteps({ shopName, isStoreSelected })

    const { data } = useGetOnboardingData(shopName)

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()
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
            doUpdateOnboardingMutation(
                {
                    id: data.id,
                    data: {
                        ...data,
                        id: data.id,
                        completedDatetime: getMomentUtcISOString(),
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

                        logEvent(SegmentEvent.AiAgentOnboardingCompleted, {
                            onboardingFlow: 'wizard',
                            totalSteps,
                            shopName,
                        })

                        history.push({
                            pathname: nextPath,
                            search: `?shopName=${encodeURIComponent(shopName)}&from=onboarding`,
                        })
                    },
                },
            )
        }
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
                isLoading={isUpdatingOnboarding}
            >
                <StepHeader
                    title="AI Agent is syncing your knowledge sources"
                    subtitle={
                        <Text>
                            <Text variant="bold">
                                {`We're setting things up so AI Agent can respond with confidence.`}
                            </Text>{' '}
                            No action needed right now, but you can add more
                            knowledge at any time later in settings.
                        </Text>
                    }
                />
                <Box
                    marginTop="lg"
                    marginBottom="md"
                    display="flex"
                    alignItems="center"
                    gap="xs"
                >
                    <Text variant="bold">
                        {`We're syncing these knowledge sources`}
                    </Text>
                    <Tooltip
                        placement="top left"
                        delay={0}
                        trigger={<Icon name="info" size="sm" />}
                    >
                        <TooltipContent title="These knowledge sources were pulled from your initial Gorgias setup. They will be used to provide context for AI Agent to respond to customer inquiries." />
                    </Tooltip>
                </Box>
                <KnowledgeResourcesList knowledgeSources={knowledgeSources} />
            </OnboardingContentContainer>
            <OnboardingPreviewContainer>
                <KnowledgePreview shopName={shopName} />
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}

interface KnowledgeResourcesListProps {
    knowledgeSources: KnowledgeSourceStatuses
}

const KnowledgeResourcesList: React.FC<KnowledgeResourcesListProps> = ({
    knowledgeSources,
}) => (
    <div>
        {Object.entries(knowledgeSources).map(([type, knowledgeSource]) => {
            if (!knowledgeSource) return null

            const { isLoading, label, status } = knowledgeSource
            return (
                <Box
                    padding="md"
                    marginBottom="xs"
                    key={type}
                    className={css.card}
                >
                    {isLoading ? (
                        <Box
                            width="100%"
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Skeleton height={24} width={140} />
                            <Skeleton height={24} width={80} />
                        </Box>
                    ) : (
                        <KnowledgeResourceLine
                            name={label}
                            type={type as KnowledgeSourceType}
                            isReady={status === KnowledgeStatus.DONE}
                        />
                    )}
                </Box>
            )
        })}
    </div>
)
