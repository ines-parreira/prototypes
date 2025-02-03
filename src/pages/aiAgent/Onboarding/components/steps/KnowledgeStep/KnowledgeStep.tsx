import React, {useCallback} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {ShopifyIntegration} from 'models/integration/types'
import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'
import KnowledgePreview from 'pages/aiAgent/Onboarding/components/KnowledgePreview/KnowledgePreview'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {
    KnowledgeSourceType,
    KnowledgeStatus,
    StepProps,
    TemporaryKnowledgeData,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import {useGetHelpCentersByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'
import {useGetKnowledgeStatusByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import {Separator} from 'pages/common/components/Separator/Separator'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'

import GorgiasIcon from './icons/GorgiasIcon'
import {KnowledgeResourceLine} from './KnowledgeResourceLine'
import css from './KnowledgeStep.less'

export const KnowledgeStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {shopName, setOnboardingData} = useOnboardingContext()

    /// This part is a temporary block to be removed once the actual data is available
    const shopifyIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName || '')
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
        dummyKnowledgeData
    )
    const shopKnowledgeIsReady = shopKnowledgeStatus === KnowledgeStatus.DONE

    const {isHelpCenterLoading, helpCenters} = useGetHelpCentersByShopName(
        shopName || ''
    )
    const hasHelpCenter = !!helpCenters.length

    const onNextClickWithValidation = useCallback(() => {
        if (!hasHelpCenter) {
            return
        }

        setOnboardingData({
            helpCenterId: helpCenters[0].id.toString(),
        })
        onNextClick()
    }, [setOnboardingData, onNextClick, hasHelpCenter, helpCenters])

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClickWithValidation}
                onBackClick={onBackClick}
            >
                <MainTitle
                    titleBlack="Great, start building "
                    titleMagenta="AI Agent's knowledge"
                />
                <AIBanner fillStyle="fill">
                    Your AI Agent uses your knowledge to respond to customers,
                    organizing information into clear categories for accuracy.
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
