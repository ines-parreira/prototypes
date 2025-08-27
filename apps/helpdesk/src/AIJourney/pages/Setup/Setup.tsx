import { useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { useHistory, useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import { Button } from 'AIJourney/components'
import { useAiJourneyPhoneList, useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useIntegrations } from 'AIJourney/providers'
import {
    useCreateNewJourney,
    useJourneyConfiguration,
    useJourneys,
} from 'AIJourney/queries'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    EnableDiscountField,
    JourneyMessageInstructionsField,
    MaximumDiscountField,
    MessagesToSendField,
    MessageWithDiscountCodeField,
    PhoneNumberField,
} from './fields'

import css from './Setup.less'

export const Setup = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const dispatch = useAppDispatch()
    const [isVisible, setIsVisible] = useState(true)
    const customInstructionEnabled = useFlag(
        FeatureFlagKey.AiJourneyCustomInstructions,
    )

    const { currentIntegration, isLoading: isLoadingIntegrations } =
        useIntegrations(shopName)

    const integrationId = useMemo(() => {
        return currentIntegration?.id
    }, [currentIntegration])

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { storeConfiguration, isLoading: isLoadingStoreConfiguration } =
        useStoreConfiguration({
            shopName,
            accountDomain,
        })

    const { data: merchantAiJourneys, isLoading: isLoadingJourneys } =
        useJourneys(integrationId, {
            enabled: !!integrationId,
        })

    const abandonedCartJourney = merchantAiJourneys?.find(
        (journey) => journey.type === 'cart_abandoned',
    )

    const { data: journeyParams, isLoading: isLoadingJourneyConfiguration } =
        useJourneyConfiguration(abandonedCartJourney?.id, {
            enabled: !!integrationId && !!abandonedCartJourney?.id,
        })

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
    const [journeyMessageInstructions, setJourneyMessageInstructions] =
        useState<string>(abandonedCartJourney?.message_instructions || '')

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
        }
    }, [journeyParams, currentPhoneNumber])

    useEffect(() => {
        if (abandonedCartJourney?.message_instructions) {
            setJourneyMessageInstructions(
                abandonedCartJourney.message_instructions,
            )
        }
    }, [abandonedCartJourney])

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

    const handleNumberOfMessageChange = (newValue: number) => {
        setNumberOfMessageValue(newValue)
        setDiscountCodeThreshold(1)
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
                    message_instructions: journeyMessageInstructions || null,
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

    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        abandonedCartJourney,
        followUpValue: numberOfMessageValue - 1,
        isDiscountEnabled,
        discountValue,
        phoneNumberValue,
        discountCodeThresholdValue: isDiscountEnabled
            ? discountCodeThreshold
            : undefined,
    })

    const handleContinue = async () => {
        try {
            if (abandonedCartJourney) {
                await handleUpdate({
                    journeyState: abandonedCartJourney.state,
                    journeyMessageInstructions,
                })
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

    const isDiscountFieldValid = isDiscountEnabled
        ? !!discountValue && isDiscountValueValid
        : true

    const shouldDisableButton = !isDiscountFieldValid || !phoneNumberValue
    const showMessageWithDiscountCode =
        isDiscountEnabled && numberOfMessageValue > 1

    const isLoading =
        isLoadingIntegrations ||
        isLoadingStoreConfiguration ||
        isLoadingJourneys ||
        (!!abandonedCartJourney?.id && isLoadingJourneyConfiguration)

    if (isLoading) {
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

            {customInstructionEnabled && (
                <JourneyMessageInstructionsField
                    value={journeyMessageInstructions}
                    onChange={setJourneyMessageInstructions}
                    maxLength={4000}
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
