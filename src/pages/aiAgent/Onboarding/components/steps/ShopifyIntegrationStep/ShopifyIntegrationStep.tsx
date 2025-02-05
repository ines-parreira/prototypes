import React, {useMemo, useState, useCallback} from 'react'

import {FormProvider, useForm} from 'react-hook-form'

import {useHistory} from 'react-router-dom'

import {z} from 'zod'

import shopify from 'assets/img/integrations/shopify.png'
import {StoreIntegration} from 'models/integration/types'
import {DropdownSelector} from 'pages/aiAgent/Onboarding/components/DropdownSelector/DropdownSelector'
import IntegrationCard from 'pages/aiAgent/Onboarding/components/IntegrationCard'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {Separator} from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import StatusBadge, {
    StatusEnum,
} from 'pages/aiAgent/Onboarding/components/StatusBadge'
import css from 'pages/aiAgent/Onboarding/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep.less'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    useGetOnboardingData,
    useUpdateOnboardingCache,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {useOnboardingIntegrationRedirection} from 'pages/aiAgent/Onboarding/hooks/useOnboardingIntegrationRedirection'
import {useShopifyIntegrations} from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
    LoadingPulserIcon,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'

import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

const ShopifyIcon: React.FC<{size?: string}> = ({size}) => (
    <img
        src={shopify}
        alt="Shopify"
        height={size ? size : 'auto'}
        width="auto"
    />
)

const ShopifyFormSchema = z.object({
    shop: z.string().min(1, 'Please select a Shopify store'),
    shopType: z.string().optional(),
})

type ShopifyFormValues = z.infer<typeof ShopifyFormSchema>

export const ShopifyIntegrationStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const {redirectToIntegration} = useOnboardingIntegrationRedirection()
    const shopifyIntegrations: StoreIntegration[] = useShopifyIntegrations()
    const {emailIntegrations, defaultIntegration} = useEmailIntegrations()

    const {data, isLoading} = useGetOnboardingData()
    const updateOnboardingCache = useUpdateOnboardingCache()

    const history = useHistory()

    const [shopError, setShopError] = useState<string | null>(null)

    const selectedIntegration = useMemo(
        () =>
            shopifyIntegrations.find((store) => store.name === data?.shop) ||
            shopifyIntegrations[0],
        [shopifyIntegrations, data?.shop]
    )

    const methods = useForm<ShopifyFormValues>({
        values: {
            shop: selectedIntegration?.name ?? '',
            shopType: selectedIntegration?.type ?? '',
        },
    })

    const {watch, setValue, handleSubmit} = methods

    // Watch form state
    const selectedShop = watch('shop')
    const selectedShopType = watch('shopType')

    // Update shopName in cache when selection changes
    const onSelectShop = useCallback(
        (shopId: number | null) => {
            const foundShop = shopifyIntegrations.find(
                (shop) => shop.id === shopId
            )
            if (foundShop) {
                setValue('shop', foundShop.name)
                updateOnboardingCache('shop', foundShop.name)
                setValue('shopType', foundShop.type)
                setShopError(null)
            }
        },
        [shopifyIntegrations, setValue, updateOnboardingCache]
    )

    const redirectToShopify = useCallback(() => {
        redirectToIntegration('https://apps.shopify.com/helpdesk')
    }, [redirectToIntegration])

    const onBackClick = () => {
        updateOnboardingCache('shop', selectedShop)
        goToStep(WizardStepEnum.SKILLSET)
    }

    const onNextClick = () => {
        let newPath = `/app/ai-agent/${selectedShopType}/${selectedShop}/onboarding/${WizardStepEnum.CHANNELS}`
        if (!shopifyIntegrations.length) {
            setShopError(
                'No Shopify store connected. Please connect a store before proceeding.'
            )
            return
        }
        updateOnboardingCache('shop', selectedShop)
        if (!emailIntegrations && !defaultIntegration) {
            newPath = `app/ai-agent/${selectedShopType}/${selectedShop}/onboarding/${WizardStepEnum.EMAIL_INTEGRATION}`
            history.push(newPath)
            return
        }

        history.push(newPath)
    }

    const renderContent = useMemo(() => {
        if (isLoading) {
            return <LoadingPulserIcon icon={<ShopifyIcon size="40%" />} />
        }

        return (
            <>
                {shopError && (
                    <>
                        <AIBanner hasError fillStyle="fill">
                            {shopError}
                        </AIBanner>
                        <Separator />
                    </>
                )}
                {selectedShop && (
                    <>
                        <AIBanner fillStyle="fill">
                            {shopifyIntegrations.length > 1
                                ? "You're already connected to Shopify. Select your store to proceed."
                                : "You're already connected to Shopify. Click next to proceed."}
                        </AIBanner>
                        <Separator />
                    </>
                )}
                <IntegrationCard
                    icon={<ShopifyIcon size="40px" />}
                    title="Connect Shopify"
                    description="Empower your AI Agent with access to customer orders and data, enabling it to answer questions and perform actions seamlessly."
                    status={
                        selectedShop ? (
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
                    {shopifyIntegrations.length > 0 && (
                        <div className={css.content}>
                            <DropdownSelector
                                items={shopifyIntegrations}
                                selectedKey={selectedIntegration.id}
                                setSelectedKey={onSelectShop}
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
            </>
        )
    }, [
        isLoading,
        shopError,
        selectedShop,
        shopifyIntegrations,
        selectedIntegration,
        onSelectShop,
        redirectToShopify,
    ])

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNextClick={handleSubmit(onNextClick)}
                    onBackClick={onBackClick}
                >
                    <MainTitle
                        titleBlack="First, let's connect your "
                        titleMagenta="Shopify account"
                    />
                    <Separator />
                    {renderContent}
                </OnboardingContentContainer>
                <OnboardingPreviewContainer
                    isLoading={true}
                    icon={<ShopifyIcon size="40%" />}
                />
            </OnboardingBody>
        </FormProvider>
    )
}
