import React from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {ShopifyIntegration} from 'models/integration/types'
import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'
import KnowledgePreview from 'pages/aiAgent/Onboarding/components/KnowledgePreview/KnowledgePreview'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import GorgiasIcon from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/icons/GorgiasIcon'
import {KnowledgeResourceLine} from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeResourceLine'
import css from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeStep.less'
import {
    KnowledgeSourceType,
    KnowledgeStatus,
    StepProps,
    TemporaryKnowledgeData,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {useGetHelpCentersByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetHelpCentersByShopName'
import {useGetKnowledgeStatusByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import {
    useGetOnboardingData,
    useUpdateOnboardingCache,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import {Separator} from 'pages/common/components/Separator/Separator'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'

export const KnowledgeStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    setCurrentStep,
}) => {
    const {data, isLoading} = useGetOnboardingData()
    const updateOnboardingCache = useUpdateOnboardingCache()

    const shopName = data?.shop ?? ''

    /// This part is a temporary block to be removed once the actual data is available
    const shopifyIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName || '')
    ).toJS()

    useCheckStoreIntegration({storeName: shopName, isLoading, setCurrentStep})

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

    const onNextClick = () => {
        if (!hasHelpCenter) {
            return
        }
        updateOnboardingCache('helpCenterId', helpCenters[0].id.toString())
    }

    const onBackClick = () => {
        setCurrentStep?.(WizardStepEnum.HANDOVER)
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
