import { useEffect, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import { Button } from 'AIJourney/components'
import { useAiJourneyPhoneList, useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { useCreateNewJourney } from 'AIJourney/queries'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    EnableDiscountField,
    EnableImageField,
    MaximumDiscountField,
    MessagesToSendField,
    MessageWithDiscountCodeField,
    PhoneNumberField,
} from './fields'

import css from './Setup.less'

export const Setup = () => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const [isVisible, setIsVisible] = useState(true)
    const smsImagesEnabled = useFlag(FeatureFlagKey.AiJourneySmsImagesEnabled)

    const {
        currentJourney,
        journeyData,
        currentIntegration,
        shopName,
        isLoading: isLoadingJourneyData,
        journeyType,
        storeConfiguration,
    } = useJourneyContext()

    const integrationId = currentIntegration?.id

    const { configuration: journeyParams } = journeyData || {}

    const { marketingCapabilityPhoneNumbers } = useAiJourneyPhoneList(
        storeConfiguration?.monitoredSmsIntegrations ?? [],
    )

    const currentPhoneNumber = marketingCapabilityPhoneNumbers.find(
        (phoneNumber) =>
            phoneNumber.integrations.find(
                (integration) => integration.type === 'sms',
            )?.id === journeyParams?.sms_sender_integration_id,
    )

    const createNewJourney = useCreateNewJourney()

    const [numberOfMessageValue, setNumberOfMessageValue] = useState<number>(
        (journeyParams?.max_follow_up_messages ?? 0) + 1,
    )
    const [isDiscountEnabled, setIsDiscountEnabled] = useState(
        journeyParams?.offer_discount || false,
    )
    const [discountValue, setDiscountValue] = useState(
        journeyParams?.max_discount_percent?.toString() || '',
    )
    const [isDiscountValueValid, setIsDiscountValueValid] = useState(true)
    const [discountCodeThreshold, setDiscountCodeThreshold] = useState<number>(
        journeyParams?.discount_code_message_threshold ?? 1,
    )
    const [phoneNumberValue, setPhoneNumberValue] = useState<
        NewPhoneNumber | undefined
    >(currentPhoneNumber)
    const [isImageEnabled, setIsImageEnabled] = useState(
        journeyParams?.include_image || false,
    )

    useEffect(() => {
        if (journeyParams) {
            const numberOfMessages =
                (journeyParams.max_follow_up_messages ?? 0) + 1
            setNumberOfMessageValue(numberOfMessages)
            setIsDiscountEnabled(journeyParams.offer_discount || false)
            setDiscountValue(
                journeyParams.max_discount_percent?.toString() || '',
            )
            setPhoneNumberValue(currentPhoneNumber)
            setDiscountCodeThreshold(
                journeyParams.discount_code_message_threshold ?? 1,
            )
            setIsImageEnabled(journeyParams.include_image || false)
        }
    }, [journeyParams, currentPhoneNumber])

    const handleDiscountToggle = () => {
        setIsDiscountEnabled((prev: boolean) => !prev)
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

    const handleNumberOfMessageChange = (newValue: number) => {
        setNumberOfMessageValue(newValue)
        setDiscountCodeThreshold(1)
    }

    const handleImageToggle = () => {
        setIsImageEnabled((prev: boolean) => !prev)
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
                    max_follow_up_messages: numberOfMessageValue - 1,
                    offer_discount: isDiscountEnabled,
                    max_discount_percent: Number(discountValue),
                    sms_sender_integration_id:
                        phoneNumberValue?.integrations.find(
                            (integration) => integration.type === 'sms',
                        )?.id,
                    sms_sender_number: phoneNumberValue?.phone_number,
                    discount_code_message_threshold: isDiscountEnabled
                        ? discountCodeThreshold
                        : undefined,
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

    const {
        handleUpdate,
        isLoading: isLoadingHandleUpdate,
        isSuccess: isSuccessHandleUpdate,
    } = useJourneyUpdateHandler({
        integrationId,
        journey: currentJourney,
        followUpValue: numberOfMessageValue - 1,
        isDiscountEnabled,
        discountValue,
        phoneNumberValue,
        discountCodeThresholdValue: isDiscountEnabled
            ? discountCodeThreshold
            : undefined,
        includeImage: isImageEnabled,
    })

    const handleContinue = async () => {
        try {
            if (currentJourney) {
                await handleUpdate({
                    journeyMessageInstructions:
                        currentJourney.message_instructions,
                    journeyState: currentJourney.state,
                })
            } else {
                await handleCreate()
            }
            setIsVisible(false)
            history.push(`/app/ai-journey/${shopName}/${journeyType}/test`)
        } catch {
            return // Error handling is done in the handleUpdate and handleCreate functions
        }
    }

    const isDiscountFieldValid = isDiscountEnabled
        ? !!discountValue && isDiscountValueValid
        : true

    const shouldDisableButton =
        !isDiscountFieldValid ||
        !phoneNumberValue ||
        isLoadingHandleUpdate ||
        isSuccessHandleUpdate
    const showMessageWithDiscountCode =
        isDiscountEnabled && numberOfMessageValue > 1

    if (isLoadingJourneyData) {
        return <LoadingSpinner />
    }

    return (
        <motion.div
            className={css.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
        >
            <PhoneNumberField
                options={marketingCapabilityPhoneNumbers}
                value={phoneNumberValue}
                onChange={handlePhoneNumberChange}
            />
            <MessagesToSendField
                value={numberOfMessageValue}
                onChange={handleNumberOfMessageChange}
            />
            {smsImagesEnabled && (
                <EnableImageField
                    isEnabled={isImageEnabled}
                    journeyType={journeyType}
                    onChange={handleImageToggle}
                />
            )}
            <EnableDiscountField
                isEnabled={isDiscountEnabled}
                onChange={handleDiscountToggle}
            />

            {isDiscountEnabled && (
                <MaximumDiscountField
                    value={discountValue}
                    isDisabled={!isDiscountEnabled}
                    onChange={handleMaximumDiscountChange}
                    onValidationChange={handleValidationChange}
                />
            )}

            {showMessageWithDiscountCode && (
                <MessageWithDiscountCodeField
                    value={discountCodeThreshold}
                    numberOfMessages={numberOfMessageValue}
                    onChange={setDiscountCodeThreshold}
                />
            )}

            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={`/app/ai-journey/${shopName}`}
                    label="Cancel"
                />
                <Button
                    label="Continue"
                    onClick={handleContinue}
                    isDisabled={shouldDisableButton}
                />
            </div>
        </motion.div>
    )
}
