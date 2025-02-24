import React, {useMemo, useState, useCallback} from 'react'

import {FormProvider, useForm} from 'react-hook-form'

import {useHistory, useParams} from 'react-router-dom'

import {z} from 'zod'

import shopify from 'assets/img/integrations/shopify.png'
import useAppSelector from 'hooks/useAppSelector'
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
import {useCreateOnboarding} from 'pages/aiAgent/Onboarding/hooks/useCreateOnboarding'
import {useGetOnboardingData} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {useGetOnboardingDataByShopName} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName'
import {useOnboardingIntegrationRedirection} from 'pages/aiAgent/Onboarding/hooks/useOnboardingIntegrationRedirection'
import {useShopifyIntegrations} from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import {useSteps} from 'pages/aiAgent/Onboarding/hooks/useSteps'
import {useUpdateOnboarding} from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
    LoadingPulserIcon,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'

import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

const ShopifyIcon: React.FC<{size?: string}> = ({size}) => (
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

export const ShopifyIntegrationStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const {shopName} = useParams<{shopName: string}>()
    const {validSteps} = useSteps({shopName})
    const {redirectToIntegration} = useOnboardingIntegrationRedirection()
    const shopifyIntegrations: StoreIntegration[] = useShopifyIntegrations()
    const {emailIntegrations, defaultIntegration} = useEmailIntegrations()

    const {data, isLoading: isLoadingOnboardingData} =
        useGetOnboardingData(shopName)
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

    const methods = useForm<ShopifyFormValues>({
        values: {
            shopName: data?.shopName ?? '',
            shopType: data?.shopType ?? '',
        },
    })

    const {
        watch,
        setValue,
        handleSubmit,
        formState: {isDirty},
    } = methods

    // Watch form state
    const selectedShop = watch('shopName') || shopifyIntegrations[0]?.name
    const selectedShopType = watch('shopType') || shopifyIntegrations[0]?.type

    const {
        data: onBoardingDataBySelectedShop,
        isLoading: isLoadingOnboardingDataBySelectedShop,
    } = useGetOnboardingDataByShopName(selectedShop)

    const isLoading =
        isLoadingOnboardingData ||
        isUpdatingOnboarding ||
        isCreatingOnboarding ||
        isLoadingOnboardingDataBySelectedShop

    const selectedIntegration = useMemo(
        () =>
            shopifyIntegrations.find((store) => store.name === selectedShop) ||
            shopifyIntegrations[0],
        [shopifyIntegrations, selectedShop]
    )

    const onSelectShop = (shopId: number | null) => {
        const foundShop = shopifyIntegrations.find((shop) => shop.id === shopId)
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
        redirectToIntegration('https://apps.shopify.com/helpdesk')
    }, [redirectToIntegration])

    const onBackClick = useCallback(() => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }, [validSteps, currentStep, goToStep])

    const goToNextStep = () => {
        let newPath = `/app/ai-agent/${selectedShopType}/${selectedShop}/onboarding/${WizardStepEnum.CHANNELS}`
        if (!emailIntegrations && !defaultIntegration) {
            newPath = `/app/ai-agent/${selectedShopType}/${selectedShop}/onboarding/${WizardStepEnum.EMAIL_INTEGRATION}`
        }
        history.push(newPath)
    }

    const onNextClick = () => {
        if (!shopifyIntegrations.length) {
            setShopError(
                'No Shopify store connected. Please connect a store before proceeding.'
            )
            return
        }

        const updatedData = {
            scopes: data?.scopes,
            gorgiasDomain: accountDomain,
            shopName: selectedShop,
            currentStepName:
                !emailIntegrations && !defaultIntegration
                    ? WizardStepEnum.EMAIL_INTEGRATION
                    : WizardStepEnum.CHANNELS,
        }

        if ((!isDirty && !!data?.shopName) || onBoardingDataBySelectedShop) {
            goToNextStep()
            return
        }
        if (data && 'id' in data) {
            doUpdateOnboardingMutation(
                {...data, id: data.id as string, data: updatedData},
                {
                    onSuccess: () => {
                        goToNextStep()
                    },
                }
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
                    <MainTitle
                        titleBlack="First, let's connect your "
                        titleMagenta="Shopify account"
                    />
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
