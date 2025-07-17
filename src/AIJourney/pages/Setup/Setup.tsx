import { useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory, useParams } from 'react-router-dom'

import { Button } from 'AIJourney/components'
import { useAiJourneyPhoneList, useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useIntegrations } from 'AIJourney/providers'
import {
    useCreateNewJourney,
    useJourneyConfiguration,
    useJourneys,
} from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    EnableDiscountField,
    FollowUpField,
    MaximumDiscountField,
    PhoneNumberField,
} from './fields'

import css from './Setup.less'

export const Setup = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const dispatch = useAppDispatch()
    const [isVisible, setIsVisible] = useState(true)

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

    const { marketingCapabilityPhoneNumbers } = useAiJourneyPhoneList()

    const currentPhoneNumber = marketingCapabilityPhoneNumbers.find(
        (phoneNumber) =>
            phoneNumber.integrations.find(
                (integration) => integration.type === 'sms',
            )?.id === journeyParams?.sms_sender_integration_id,
    )

    const createNewJourney = useCreateNewJourney()

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

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        currentIntegration,
        abandonedCartJourney,
        followUpValue,
        isDiscountEnabled,
        discountValue,
        phoneNumberValue,
    })

    const handleContinue = async () => {
        try {
            if (abandonedCartJourney) {
                await handleUpdate()
            } else {
                await handleCreate()
            }
            setIsVisible(false)
            setTimeout(() => {
                history.push(`/app/ai-journey/${shopName}/activation`)
            }, 700)
        } catch (error) {
            void dispatch(
                notify({
                    message: `Error creating new journey: ${error}`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

    const followUpOptions = [1, 2, 3]

    const isDiscountFieldValid = isDiscountEnabled
        ? !!discountValue && isDiscountValueValid
        : true

    const shouldDisableButton = !isDiscountFieldValid || !phoneNumberValue

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
