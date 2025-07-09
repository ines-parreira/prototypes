import { useEffect, useMemo, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import { Button } from 'AIJourney/components'
import { useIntegrations } from 'AIJourney/providers'
import {
    useCreateNewJourney,
    useJourneyConfiguration,
    useJourneys,
    useUpdateJourney,
} from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    EnableDiscountField,
    FollowUpField,
    MaximumDiscountField,
    PhoneNumberField,
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

    const { data: merchantAiJourneys } = useJourneys(currentIntegration?.id, {
        enabled: !!currentIntegration?.id,
    })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )

    const { data: journeyParams } = useJourneyConfiguration(
        abandonedCartJourney?.id,
        {
            enabled: !!currentIntegration?.id && !!abandonedCartJourney?.id,
        },
    )

    const createNewJourney = useCreateNewJourney()
    const updateJourney = useUpdateJourney()

    const [followUpValue, setFollowUpValue] = useState(
        journeyParams?.max_follow_up_messages || undefined,
    )
    const [isDiscountEnabled, setIsDiscountEnabled] = useState(
        journeyParams?.offer_discount || false,
    )
    const [discountValue, setDiscountValue] = useState(
        journeyParams?.max_discount_percent?.toString() || '',
    )
    const [phoneNumberValue, setPhoneNumberValue] = useState(
        journeyParams?.sms_sender_number || '',
    )
    const [testSmsNumber, setTestSmsNumber] = useState('')

    useEffect(() => {
        if (journeyParams) {
            setFollowUpValue(journeyParams.max_follow_up_messages || undefined)
            setIsDiscountEnabled(journeyParams.offer_discount || false)
            setDiscountValue(
                journeyParams.max_discount_percent?.toString() || '',
            )
            setPhoneNumberValue(journeyParams.sms_sender_number || '')
            setTestSmsNumber('')
        }
    }, [journeyParams])

    const handleDiscountToggle = () => {
        setIsDiscountEnabled((prev) => !prev)
    }

    const handleMaximumDiscountChange = (newValue: string) => {
        setDiscountValue(newValue)
    }

    const handlePhoneNumberChange = (newValue: string) => {
        setPhoneNumberValue(newValue)
    }

    const handleTestSmsNumberChange = (newValue: string) => {
        setTestSmsNumber(newValue)
    }

    const handleCreate = async () => {
        try {
            if (!currentIntegration?.id || !currentIntegration?.name) {
                throw new Error(
                    `Missing integration information: ID: ${currentIntegration?.id}, name: ${currentIntegration?.name}`,
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
                    // TODO: use integration ID instead of phone value
                    // sms_sender_integration_id: phoneNumberValue,
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
                !currentIntegration?.id ||
                !currentIntegration?.name ||
                !abandonedCartJourney?.id
            ) {
                throw new Error(
                    `Missing integration information: ID: ${currentIntegration?.id}, name: ${currentIntegration?.name}, journey ID: ${abandonedCartJourney?.id}`,
                )
            }

            await updateJourney.mutateAsync({
                journeyId: abandonedCartJourney?.id,
                params: {
                    // Hardcoded this state to avoid activating stores unnecessarily and keep the onboarding flow available
                    // TODO: pass this as a dynamic parameter for final release
                    state: JourneyStatusEnum.Draft,
                },
                journeyConfigs: {
                    max_follow_up_messages: followUpValue,
                    offer_discount: isDiscountEnabled,
                    max_discount_percent: Number(discountValue),
                    // TODO: use integration ID instead of phone value
                    // sms_sender_integration_id: phoneNumberValue,
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
    const optionsList = ['(415)-111-111', '(415)-222-222', '(415)-333-333']

    const isDiscountFieldValid = isDiscountEnabled ? !!discountValue : true

    const shouldDisableButton = isActivationStep
        ? !testSmsNumber
        : !isDiscountFieldValid || !followUpValue || !phoneNumberValue

    return (
        <div className={css.onboardingCard}>
            <GradientBackground />
            <div className={css.container}>
                <div style={{ marginBottom: '16px' }}>
                    <span>{currentStep} step</span>
                </div>
                {isActivationStep ? (
                    <>
                        <TestSMSField
                            value={testSmsNumber}
                            onChange={handleTestSmsNumberChange}
                        />
                    </>
                ) : (
                    <>
                        <PhoneNumberField
                            options={optionsList}
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
