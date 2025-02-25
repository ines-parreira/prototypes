import React from 'react'

import { useParams } from 'react-router-dom'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
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
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetHelpCentersByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'
import { useGetKnowledgeStatusByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import { Separator } from 'pages/common/components/Separator/Separator'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

export const KnowledgeStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const { shopName } = useParams<{ shopName: string }>()

    useCheckStoreIntegration()

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

    const onNextClick = () => {
        if (!hasHelpCenter) {
            return
        }
    }

    const onBackClick = () => {
        goToStep(WizardStepEnum.HANDOVER)
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
                    <CardContent>
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
                    </CardContent>
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
