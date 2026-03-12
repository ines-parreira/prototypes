import type React from 'react'
import { useCallback } from 'react'

import { FormProvider } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'

import { Box, Icon } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import {
    aiAgentRoutes,
    getAiAgentNavigationRoutes,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { StepHeader } from 'pages/aiAgent/Onboarding_V2/components/StepHeader/StepHeader'
import { ShopifyConnectionBanner } from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/components/ShopifyConnectionBanner'
import { ShopifyStoreSelector } from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/components/ShopifyStoreSelector'
import { useAvailableShopifyStores } from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/hooks/useAvailableShopifyStores'
import { useShopifyStepForm } from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/hooks/useShopifyStepForm'
import { useShopifyStepNavigation } from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/hooks/useShopifyStepNavigation'
import type { StepProps } from 'pages/aiAgent/Onboarding_V2/components/steps/types'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted'
import { useCheckStoreAlreadyConfigured } from 'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useOnboardingIntegrationRedirection } from 'pages/aiAgent/Onboarding_V2/hooks/useOnboardingIntegrationRedirection'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations'
import { useSteps } from 'pages/aiAgent/Onboarding_V2/hooks/useSteps'
import { useTrackFieldValue } from 'pages/aiAgent/Onboarding_V2/hooks/useTrackFieldValue'
import {
    LoadingPulserIcon,
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

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
    const {
        shopName,
        shopType,
        step: stepName,
    } = useParams<{
        shopName: string
        shopType: string
        step: string
    }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })
    const { redirectToIntegration } = useOnboardingIntegrationRedirection()
    const shopifyIntegrations = useShopifyIntegrations()
    const scopes = useAiAgentScopesForAutomationPlan(shopName)
    const { isInAiAgentTrial } = useTrialAccess(shopName)

    useCheckOnboardingCompleted()
    useCheckStoreAlreadyConfigured()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const history = useHistory()

    const onCloseNavigation = useCallback(() => {
        if (isInAiAgentTrial) {
            history.push('/app/home')
            return
        }
        if (shopName) {
            history.push(getAiAgentNavigationRoutes(shopName).main)
            return
        }
        history.push(aiAgentRoutes.overview)
    }, [history, isInAiAgentTrial, shopName])

    const {
        availableStores: filteredShopifyIntegrations,
        isLoading: isLoadingStoreConfigurations,
    } = useAvailableShopifyStores({
        accountDomain,
        shopifyIntegrations,
    })

    const {
        methods,
        selectedShop,
        selectedShopType,
        selectedIntegration,
        onSelectShop,
        isDirty,
    } = useShopifyStepForm({
        shopName,
        shopType,
        availableStores: filteredShopifyIntegrations,
        setShopError: () => {}, // Will be managed by navigation hook
    })

    const { handleSubmit } = methods

    useTrackFieldValue({
        currentStep,
        stepName,
        shopName,
        fieldName: 'selectedShop',
        fieldType: 'select',
        fieldValue: selectedShop,
    })

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(selectedShop)

    const {
        onNextClick,
        onBackClick,
        shopError,
        isLoading: isNavigationLoading,
    } = useShopifyStepNavigation({
        currentStep,
        validSteps,
        goToStep,
        selectedShop,
        selectedShopType,
        setIsStoreSelected,
        history,
        availableStores: filteredShopifyIntegrations,
        onboardingData: data,
        isDirty,
        scopes,
        accountDomain,
    })

    const isLoading = isLoadingOnboardingData || isNavigationLoading

    const redirectToShopify = useCallback(() => {
        redirectToIntegration(
            'https://apps.shopify.com/helpdesk',
            IntegrationType.Shopify,
        )
    }, [redirectToIntegration])

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    isLoading={isLoading}
                    onNextClick={handleSubmit(onNextClick)}
                    onBackClick={onBackClick}
                    onCloseClick={onCloseNavigation}
                >
                    <StepHeader title="First, let's connect your Shopify account" />
                    <Box marginTop="lg" flexDirection="column" gap="md">
                        {isLoading ? (
                            <LoadingPulserIcon
                                icon={<Icon name="app-shopify" size="lg" />}
                            />
                        ) : (
                            <>
                                <ShopifyConnectionBanner
                                    shopError={shopError}
                                    selectedShop={selectedShop}
                                    storeCount={
                                        filteredShopifyIntegrations.length
                                    }
                                />
                                <ShopifyStoreSelector
                                    availableStores={
                                        filteredShopifyIntegrations
                                    }
                                    allStores={shopifyIntegrations}
                                    selectedStore={selectedIntegration}
                                    selectedShop={selectedShop}
                                    onSelectStore={onSelectShop}
                                    onConnect={redirectToShopify}
                                    isLoading={isLoadingStoreConfigurations}
                                />
                            </>
                        )}
                    </Box>
                </OnboardingContentContainer>
                <OnboardingPreviewContainer
                    isLoading={true}
                    icon={<Icon name="app-shopify" size="lg" />}
                    showCaption={true}
                    caption="Connecting your Shopify store to Gorgias sends real-time product, customer, and transaction data to your AI Agent."
                />
            </OnboardingBody>
        </FormProvider>
    )
}
