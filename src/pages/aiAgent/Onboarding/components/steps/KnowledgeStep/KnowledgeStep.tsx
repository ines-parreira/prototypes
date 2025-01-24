import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {ShopifyIntegration} from 'models/integration/types'
import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {
    KnowledgeSourceType,
    KnowledgeStatus,
    StepProps,
    TemporaryKnowledgeData,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import {useGetKnowledgeStatusByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'

import {Separator} from 'pages/common/components/Separator/Separator'
import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'

import {KnowledgeResourceLine} from './KnowledgeResourceLine'
import css from './KnowledgeStep.less'

export const KnowledgeStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {shopName} = useOnboardingContext()

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

    // TODO: get help center status - enough if just exists for now
    // TODO: use skeleton loader when the data is loading
    const helpCenter = true

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
                        {shopName && helpCenter && (
                            <Separator className={css.separator} />
                        )}
                        {helpCenter && (
                            <KnowledgeResourceLine
                                name="Help center example"
                                type={KnowledgeSourceType.HELP_CENTER}
                                isReady={true}
                            />
                        )}
                    </CardContent>
                </Card>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={true} icon={''}>
                <div>
                    <h2>Preview</h2>
                    <div>
                        <p>Hi, I'm Gorgias. How can I help you today?</p>
                    </div>
                </div>
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
