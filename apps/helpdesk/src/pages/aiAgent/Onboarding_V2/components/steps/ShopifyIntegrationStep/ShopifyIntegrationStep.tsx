import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

import { FormProvider, useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import { z } from 'zod'

import { Heading } from '@gorgias/axiom'

import shopify from 'assets/img/integrations/shopify.png'
import useAppSelector from 'hooks/useAppSelector'
import type { OnboardingData } from 'models/aiAgent/types'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { DropdownSelector } from 'pages/aiAgent/Onboarding_V2/components/DropdownSelector/DropdownSelector'
import IntegrationCard from 'pages/aiAgent/Onboarding_V2/components/IntegrationCard'
import { Separator } from 'pages/aiAgent/Onboarding_V2/components/Separator/Separator'
import StatusBadge, {
    StatusEnum,
} from 'pages/aiAgent/Onboarding_V2/components/StatusBadge'
import css from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep.less'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useCreateOnboarding'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useOnboardingIntegrationRedirection } from 'pages/aiAgent/Onboarding_V2/hooks/useOnboardingIntegrationRedirection'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    LoadingPulserIcon,
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const ShopifyIcon: React.FC<{ size?: string }> = ({ size }) => (
    <img
        src={shopify}
        alt="Shopify"
        height={size ? size : 'auto'}
        width="auto"
    />
)

const ShopifyFormSchema = z.object({
    shopName: z.string().min(1, 'Please select a Shopify store'),
    shopType: z.string().optional(),
})

type ShopifyFormValues = z.infer<typeof ShopifyFormSchema>

type ShopifyIntegrationStepProps = StepProps & {
    setIsStoreSelected: (isStoreSelected: boolean) => void
}

export const ShopifyIntegrationStep: React.FC<ShopifyIntegrationStepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    setIsStoreSelected,
    isStoreSelected,
}) => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })
    const { redirectToIntegration } = useOnboardingIntegrationRedirection()
    const shopifyIntegrations = useShopifyIntegrations()
    const scopes = useAiAgentScopesForAutomationPlan(shopName)

    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()
    const {
        mutate: doCreateOnboardingMutation,
        isLoading: isCreatingOnboarding,
    } = useCreateOnboarding()

    const currentAccount = useAppSelector(getCurrentAccountState)

    const accountDomain = currentAccount.get('domain')

    const history = useHistory()

    const [shopError, setShopError] = useState<string | null>(null)

    const { isLoading: isLoadingStoreConfigurations, storeConfigurations } =
        useStoreConfigurationForAccount({
            accountDomain,
            storesName: shopifyIntegrations.map(
                (integration) => integration.name,
            ),
        })

    const filteredShopifyIntegrations = shopifyIntegrations.filter(
        (integration) =>
            !storeConfigurations?.some(
                (configuration) =>
                    configuration?.storeName === integration.name,
            ),
    )

    const methods = useForm<ShopifyFormValues>({
        values: {
            shopName: shopName ?? '',
            shopType: shopType ?? '',
        },
    })

    const {
        watch,
        setValue,
        handleSubmit,
        formState: { isDirty },
    } = methods

    // Watch form state
    const selectedShop =
        watch('shopName') || filteredShopifyIntegrations[0]?.name
    const selectedShopType =
        watch('shopType') || filteredShopifyIntegrations[0]?.type

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(selectedShop)

    const isLoading =
        isLoadingOnboardingData || isUpdatingOnboarding || isCreatingOnboarding

    const selectedIntegration = useMemo(
        () =>
            filteredShopifyIntegrations.find(
                (store) => store.name === selectedShop,
            ) || filteredShopifyIntegrations[0],
        [filteredShopifyIntegrations, selectedShop],
    )

    const onSelectShop = (shopId: number | null) => {
        const foundShop = filteredShopifyIntegrations.find(
            (shop) => shop.id === shopId,
        )
        if (foundShop) {
            setValue('shopName', foundShop.name, {
                shouldDirty: true,
            })
            setValue('shopType', foundShop.type, {
                shouldDirty: true,
            })
            setShopError(null)
        }
    }

    const redirectToShopify = useCallback(() => {
        redirectToIntegration(
            'https://apps.shopify.com/helpdesk',
            IntegrationType.Shopify,
        )
    }, [redirectToIntegration])

    const onBackClick = useCallback(() => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }, [validSteps, currentStep, goToStep])

    const goToNextStep = () => {
        const nextStep = validSteps[currentStep]?.step
        const newPath = `/app/ai-agent/${selectedShopType}/${selectedShop}/onboarding/${nextStep}`
        setIsStoreSelected(true)
        history.push(newPath)
    }

    const onNextClick = async () => {
        if (!filteredShopifyIntegrations.length) {
            setShopError(
                'No Shopify store connected. Please connect a store before proceeding.',
            )
            return
        }

        const nextStep = validSteps[currentStep]?.step
        const updatedData: Partial<OnboardingData> = {
            scopes,
            gorgiasDomain: accountDomain,
            shopName: selectedShop,
            currentStepName: nextStep,
        }

        if (!isDirty && !!data?.shopName) {
            goToNextStep()
            return
        }

        if (data && 'id' in data) {
            doUpdateOnboardingMutation(
                { ...data, id: data.id as string, data: updatedData },
                {
                    onSuccess: () => {
                        goToNextStep()
                    },
                },
            )
        } else {
            doCreateOnboardingMutation(updatedData, {
                onSuccess: () => {
                    goToNextStep()
                },
            })
        }
    }

    const renderContent = () => {
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
                            {filteredShopifyIntegrations.length > 1
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
                    {!isLoadingStoreConfigurations && (
                        <div className={css.content}>
                            {filteredShopifyIntegrations.length > 0 ? (
                                <DropdownSelector
                                    items={filteredShopifyIntegrations}
                                    selectedKey={selectedIntegration.id}
                                    setSelectedKey={onSelectShop}
                                    selectedItem={selectedIntegration}
                                    getItemKey={(item: StoreIntegration) =>
                                        item.id
                                    }
                                    getItemLabel={(item: StoreIntegration) =>
                                        item.name
                                    }
                                />
                            ) : (
                                <div className={css.noStoreContent}>
                                    All your stores have an Ai Agent configured
                                    already.
                                </div>
                            )}
                            <a className={css.link} onClick={redirectToShopify}>
                                Need to create a new store? Click here
                            </a>
                        </div>
                    )}
                </IntegrationCard>
            </>
        )
    }

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNextClick={handleSubmit(onNextClick)}
                    onBackClick={onBackClick}
                >
                    <Heading size="xxl">
                        First, let&lsquo;s connect your Shopify account
                    </Heading>
                    <Separator />
                    {renderContent()}
                </OnboardingContentContainer>
                <OnboardingPreviewContainer
                    isLoading={true}
                    icon={<ShopifyIcon size="40%" />}
                />
            </OnboardingBody>
        </FormProvider>
    )
}
