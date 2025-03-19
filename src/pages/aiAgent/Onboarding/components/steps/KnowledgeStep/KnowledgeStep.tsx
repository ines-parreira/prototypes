import { useHistory, useParams } from 'react-router-dom'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
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
    TemporaryKnowledgeData,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetHelpCentersByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'
import { useGetKnowledgeStatusByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    LoadingPulserIcon,
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import { Separator } from 'pages/common/components/Separator/Separator'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

export const KnowledgeStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const history = useHistory()

    const { shopName } = useParams<{ shopName: string }>()

    const { validSteps } = useSteps({ shopName, isStoreSelected })

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(shopName)

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()

    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()

    /// This part is a temporary block to be removed once the actual data is available
    const shopifyIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName || ''),
    ).toJS()

    const dummyKnowledgeData: TemporaryKnowledgeData[] = [
        {
            url: shopifyIntegration?.meta?.shop_domain || '',
            domain: shopifyIntegration?.meta?.shop_domain || '',
            status: KnowledgeStatus.DONE,
        },
    ]
    /// This is the end of the temporary block

    const shopKnowledgeStatus = useGetKnowledgeStatusByShopName(
        shopName || '',
        dummyKnowledgeData,
    )
    const shopKnowledgeIsReady = shopKnowledgeStatus === KnowledgeStatus.DONE

    const { isHelpCenterLoading, helpCenters } = useGetHelpCentersByShopName(
        shopName || '',
    )
    const hasHelpCenter = !!helpCenters.length
    const { routes } = useAiAgentNavigation({ shopName })

    const onNextClick = () => {
        if (data && 'id' in data) {
            doUpdateOnboardingMutation(
                {
                    id: data.id as string,
                    data: {
                        ...data,
                        id: data.id as string,
                        completedDatetime: new Date().toISOString(),
                        faqHelpCenterId: helpCenters[0]?.id ?? null,
                    },
                },

                {
                    onSuccess: () => {
                        history.push(routes.overview)
                    },
                },
            )
        }
        return
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    const renderContent = () => {
        if (isLoadingOnboardingData || isUpdatingOnboarding) {
            return <LoadingPulserIcon icon="" />
        }

        return (
            <>
                {shopName && (
                    <KnowledgeResourceLine
                        name={shopName}
                        type={KnowledgeSourceType.SHOPIFY}
                        isReady={shopKnowledgeIsReady}
                    />
                )}
                {shopName && hasHelpCenter && (
                    <Separator className={css.separator} />
                )}
                {isHelpCenterLoading ? (
                    <Skeleton height={40} />
                ) : (
                    hasHelpCenter && (
                        <KnowledgeResourceLine
                            name={helpCenters[0].name}
                            type={KnowledgeSourceType.HELP_CENTER}
                            isReady={hasHelpCenter}
                        />
                    )
                )}
            </>
        )
    }

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <MainTitle
                    titleBlack="Great, start building "
                    titleMagenta="AI Agent's knowledge"
                />
                <AIBanner fillStyle="fill">
                    Your AI Agent leverages different knowledge resources to
                    provide accurate responses to customers. You can update or
                    expand your knowledge resources anytime in your settings.
                </AIBanner>
                <Card className={css.card}>
                    <CardContent>{renderContent()}</CardContent>
                </Card>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={false}
                icon={<GorgiasIcon size="40%" />}
            >
                <KnowledgePreview />
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
