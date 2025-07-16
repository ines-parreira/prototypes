import { useEffect, useMemo, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import { Button } from 'AIJourney/components'
import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import { useIntegrations } from 'AIJourney/providers'
import {
    useCreateNewJourney,
    useJourneyConfiguration,
    useJourneys,
    useTestSms,
    useUpdateJourney,
} from 'AIJourney/queries'
import { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { useListProducts } from 'models/integration/queries'
import { IntegrationDataItem } from 'models/integration/types'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    EnableDiscountField,
    FollowUpField,
    MaximumDiscountField,
    PhoneNumberField,
    ProductSelectField,
    TestSMSField,
} from './fields'

import css from './OnboardingCard.less'

const GradientBackground = () => {
    return <div className={css.gradientBackground} />
}

type OnboardingCardProps = {
    currentStep: string
}

export const OnboardingCard = ({ currentStep }: OnboardingCardProps) => {
    const isActivationStep = currentStep === 'Activation'
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const dispatch = useAppDispatch()

    const { integrations } = useIntegrations()

    const currentIntegration = useMemo(() => {
        return integrations.find((i) => i.name === shopName)
    }, [integrations, shopName])

    const integrationId = useMemo(() => {
        return currentIntegration?.id
    }, [currentIntegration])

    const { data: merchantAiJourneys } = useJourneys(integrationId, {
        enabled: !!integrationId,
    })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )

    const { data: journeyParams } = useJourneyConfiguration(
        abandonedCartJourney?.id,
        {
            enabled: !!integrationId && !!abandonedCartJourney?.id,
        },
    )

    const { eligiblePhoneNumbers, marketingCapabilityPhoneNumbers } =
        useAiJourneyPhoneList(currentIntegration?.id)

    const integrationDataItemsResponse = useListProducts(
        integrationId ?? 0,
        !!integrationId,
        { limit: 5 },
        { refetchOnWindowFocus: false, refetchOnMount: false },
    )

    const products = useMemo(() => {
        const data = integrationDataItemsResponse?.data?.pages?.reduce(
            (acc, page) => [...acc, ...page.data.data],
            [] as IntegrationDataItem<Product>[],
        )
        return (data || [])
            .filter((item) => !!item.data.image && !!item.data.title)
            .map((item) => item.data)
    }, [integrationDataItemsResponse])

    const currentPhoneNumber = marketingCapabilityPhoneNumbers.find(
        (phoneNumber) =>
            phoneNumber.integrations.find(
                (integration) => integration.type === 'sms',
            )?.id === journeyParams?.sms_sender_integration_id,
    )

    const createNewJourney = useCreateNewJourney()
    const updateJourney = useUpdateJourney()
    const testSms = useTestSms()

    const [followUpValue, setFollowUpValue] = useState(
        journeyParams?.max_follow_up_messages || undefined,
    )
    const [isDiscountEnabled, setIsDiscountEnabled] = useState(
        journeyParams?.offer_discount || false,
    )
    const [discountValue, setDiscountValue] = useState(
        journeyParams?.max_discount_percent?.toString() || '',
    )
    const [isDiscountValueValid, setIsDiscountValueValid] = useState(true)

    const [phoneNumberValue, setPhoneNumberValue] = useState<
        NewPhoneNumber | undefined
    >(currentPhoneNumber)

    const [testSmsNumber, setTestSmsNumber] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(products[0])

    useEffect(() => {
        if (journeyParams) {
            setFollowUpValue(journeyParams.max_follow_up_messages || undefined)
            setIsDiscountEnabled(journeyParams.offer_discount || false)
            setDiscountValue(
                journeyParams.max_discount_percent?.toString() || '',
            )
            setPhoneNumberValue(currentPhoneNumber)
        }
    }, [journeyParams, currentPhoneNumber])

    const handleDiscountToggle = () => {
        setIsDiscountEnabled((prev) => !prev)
    }

    const handleMaximumDiscountChange = (newValue: string) => {
        setDiscountValue(newValue)
    }

    const handleValidationChange = (isValid: boolean) => {
        setIsDiscountValueValid(isValid)
    }

    const handlePhoneNumberChange = (newValue: NewPhoneNumber) => {
        setPhoneNumberValue(newValue)
    }

    const handleTestSmsNumberChange = (newValue: string) => {
        setTestSmsNumber(newValue)
    }

    const handleProductSelectChange = (newValue: Product) => {
        setSelectedProduct(newValue)
    }

    const handleCreate = async () => {
        try {
            if (!integrationId || !currentIntegration?.name) {
                throw new Error(
                    `Missing integration information: ID: ${integrationId}, name: ${currentIntegration?.name}`,
                )
            }

            await createNewJourney.mutateAsync({
                params: {
                    store_integration_id: currentIntegration.id,
                    store_name: currentIntegration.name,
                },
                journeyConfigs: {
                    max_follow_up_messages: followUpValue,
                    offer_discount: isDiscountEnabled,
                    max_discount_percent: Number(discountValue),
                    sms_sender_integration_id:
                        phoneNumberValue?.integrations.find(
                            (integration) => integration.type === 'sms',
                        )?.id,
                    sms_sender_number: phoneNumberValue?.phone_number,
                },
            })
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error creating new journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
            throw error
        }
    }

    const handleUpdate = async () => {
        try {
            if (
                !integrationId ||
                !currentIntegration?.name ||
                !abandonedCartJourney?.id
            ) {
                throw new Error(
                    `Missing integration information: ID: ${integrationId}, name: ${currentIntegration?.name}, journey ID: ${abandonedCartJourney?.id}`,
                )
            }

            await updateJourney.mutateAsync({
                journeyId: abandonedCartJourney?.id,
                params: {
                    state: JourneyStatusEnum.Active,
                },
                journeyConfigs: {
                    max_follow_up_messages: followUpValue,
                    offer_discount: isDiscountEnabled,
                    max_discount_percent: Number(discountValue),
                    sms_sender_integration_id:
                        phoneNumberValue?.integrations.find(
                            (integration) => integration.type === 'sms',
                        )?.id,
                    sms_sender_number: phoneNumberValue?.phone_number,
                },
            })
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error updating journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
            throw error
        }
    }

    const handleTestSms = async () => {
        try {
            if (!abandonedCartJourney?.id || !testSmsNumber) {
                void dispatch(
                    notify({
                        message: `Missing information: test number: ${testSmsNumber}, journeyID: ${abandonedCartJourney?.id}`,
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            await testSms.mutateAsync({
                // TODO use generic phone number formatting
                phoneNumber: `+1${testSmsNumber.replace(/\D/g, '')}`,
                journeyId: abandonedCartJourney?.id,
                product: {
                    product_id: String(selectedProduct.id),
                    variant_id: String(selectedProduct.variants[0]?.id),
                    price: Number(selectedProduct.variants[0]?.price),
                },
            })
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error sending test SMS: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

    const handleContinue = async () => {
        if (!isActivationStep) {
            try {
                if (abandonedCartJourney) {
                    await handleUpdate()
                } else {
                    await handleCreate()
                }
                history.push(`/app/ai-journey/${shopName}/activation`)
            } catch (error) {
                void dispatch(
                    notify({
                        message: `Error creating new journey: ${error}`,
                        status: NotificationStatus.Error,
                    }),
                )
            }
        } else {
            history.push(`/app/ai-journey/${shopName}/performance`)
        }
    }

    const followUpOptions = [1, 2, 3]

    const isDiscountFieldValid = isDiscountEnabled
        ? !!discountValue && isDiscountValueValid
        : true

    const shouldDisableButton = isActivationStep
        ? !selectedProduct || !testSmsNumber
        : !isDiscountFieldValid || !phoneNumberValue

    return (
        <div className={css.onboardingCard}>
            <GradientBackground />
            <div className={css.container}>
                <div style={{ marginBottom: '16px' }}>
                    <span>{currentStep} step</span>
                </div>
                {isActivationStep ? (
                    <>
                        <ProductSelectField
                            options={products}
                            onChange={handleProductSelectChange}
                        />
                        <TestSMSField
                            value={testSmsNumber}
                            onChange={handleTestSmsNumberChange}
                            onActionClick={handleTestSms}
                        />
                    </>
                ) : (
                    <>
                        <PhoneNumberField
                            options={eligiblePhoneNumbers}
                            value={phoneNumberValue}
                            onChange={handlePhoneNumberChange}
                        />
                        <FollowUpField
                            value={followUpValue}
                            options={followUpOptions}
                            onChange={setFollowUpValue}
                        />
                        <EnableDiscountField
                            isEnabled={isDiscountEnabled}
                            onChange={handleDiscountToggle}
                        />
                        <MaximumDiscountField
                            value={discountValue}
                            isDisabled={!isDiscountEnabled}
                            onChange={handleMaximumDiscountChange}
                            onValidationChange={handleValidationChange}
                        />
                    </>
                )}
                <Button
                    label="Continue"
                    onClick={handleContinue}
                    isDisabled={shouldDisableButton}
                />
            </div>
        </div>
    )
}
