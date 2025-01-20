import React, {useEffect, useMemo, useState} from 'react'

import shopify from 'assets/img/integrations/shopify.png'
import {StoreIntegration} from 'models/integration/types'
import {DropdownSelector} from 'pages/aiAgent/Onboarding/components/DropdownSelector/DropdownSelector'
import IntegrationCard from 'pages/aiAgent/Onboarding/components/IntegrationCard'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {Separator} from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import StatusBadge, {
    StatusEnum,
} from 'pages/aiAgent/Onboarding/components/StatusBadge'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {useShopifyIntegrations} from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'

import css from './ShopifyIntegrationStep.less'

const ShopifyIcon: React.FC<{size?: string}> = ({size}) => (
    <img
        src={shopify}
        alt="Shopify"
        height={size ? size : 'auto'}
        width="auto"
    />
)

export const ShopifyIntegrationStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {setOnboardingData} = useOnboardingContext()
    const shopifyIntegrations: StoreIntegration[] = useShopifyIntegrations()
    const [selectedId, setSelectedId] = useState<number | null>(
        shopifyIntegrations[0]?.id
    )

    const connected = !!selectedId
    const hasIntegrations = shopifyIntegrations.length > 0

    const selectedIntegration = useMemo(
        () =>
            shopifyIntegrations.find(
                (integration) => integration.id === selectedId
            ),
        [selectedId, shopifyIntegrations]
    )

    useEffect(() => {
        setOnboardingData &&
            setOnboardingData({shop_name: selectedIntegration?.name})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIntegration])

    const bannerText = useMemo(() => {
        if (shopifyIntegrations.length > 1) {
            return "You're already connected to Shopify. Select your store to proceed."
        }
        return "You're already connected to Shopify. Click next to proceed."
    }, [shopifyIntegrations])

    const redirectToShopify = () => {
        window.open('https://apps.shopify.com/helpdesk', '_self')
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
                    titleBlack="First, let's connect your "
                    titleMagenta="Shopify account"
                />
                <Separator />
                {connected && (
                    <AIBanner className={css.aiBanner}>{bannerText}</AIBanner>
                )}
                <IntegrationCard
                    icon={<ShopifyIcon size="40px" />}
                    title="Connect Shopify"
                    description="Empower your AI Agent with access to customer orders and data, enabling it to answer questions and perform actions seamlessly."
                    status={
                        connected ? (
                            <StatusBadge status={StatusEnum.Connected} />
                        ) : (
                            <StatusBadge status={StatusEnum.Disconnected} />
                        )
                    }
                    buttonLabel={
                        shopifyIntegrations.length === 0 ? 'Connect' : undefined
                    }
                    onClick={redirectToShopify}
                >
                    {hasIntegrations && (
                        <div className={css.content}>
                            <DropdownSelector
                                items={shopifyIntegrations}
                                selectedKey={selectedId}
                                setSelectedKey={setSelectedId}
                                selectedItem={selectedIntegration}
                                getItemKey={(item: StoreIntegration) => item.id}
                                getItemLabel={(item: StoreIntegration) =>
                                    item.name
                                }
                            />
                            <a className={css.link} onClick={redirectToShopify}>
                                Need to create a new store? Click here
                            </a>
                        </div>
                    )}
                </IntegrationCard>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer
                isLoading={true}
                icon={<ShopifyIcon size="40%" />}
            />
        </OnboardingBody>
    )
}
