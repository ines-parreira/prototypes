import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { Button } from 'AIJourney/components'
import { JOURNEY_TYPE_MAP_FROM_URL, JOURNEY_TYPES } from 'AIJourney/constants'
import { useAiJourneyPhoneList, useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { useCreateNewJourney } from 'AIJourney/queries'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
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
import { AudienceSelect } from './fields/AudienceSelect/AudienceSelect'
import { CampaignTitle } from './fields/CampaignTitle/CampaignTitle'

import css from './Setup.less'

const Fields = {
    CampaignTitle: 'campaign_title',
    FollowUps: 'followups',
    SendImage: 'send_image',
    IncludeAudience: 'include_audience',
    ExcludeAudience: 'exclude_audience',
}

type Fields = (typeof Fields)[keyof typeof Fields]

export const JOURNEY_TYPES_TO_FIELDS: Record<JOURNEY_TYPES, Fields[]> = {
    [JOURNEY_TYPES.SESSION_ABANDONMENT]: [Fields.FollowUps, Fields.SendImage],
    [JOURNEY_TYPES.CART_ABANDONMENT]: [Fields.FollowUps, Fields.SendImage],
    [JOURNEY_TYPES.WIN_BACK]: [Fields.FollowUps, Fields.SendImage],
    [JOURNEY_TYPES.CAMPAIGN]: [
        Fields.CampaignTitle,
        Fields.IncludeAudience,
        Fields.ExcludeAudience,
    ],
}

type SetupProps = {
    journeyType: JOURNEY_TYPES
}

export const Setup = ({ journeyType }: SetupProps) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const [isVisible, setIsVisible] = useState(true)
    const smsImagesEnabled = useFlag(FeatureFlagKey.AiJourneySmsImagesEnabled)

    const {
        journeyData,
        currentIntegration,
        shopName,
        isLoading: isLoadingJourneyData,
        storeConfiguration,
    } = useJourneyContext()

    const fields = JOURNEY_TYPES_TO_FIELDS[journeyType]

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

    const [campaignTitleValue, setCampaignTitleValue] = useState<
        string | undefined
    >(journeyData?.campaign?.title)

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

    const [includedAudienceListIds, setIncludedAudienceListIds] = useState<
        string[] | undefined
    >()
    const [excludedAudienceListIds, setExcludedAudienceListIds] = useState<
        string[] | undefined
    >()

    const [isLoadingHandleCreate, setIsLoadingHandleCreate] = useState(false)
    const [showValidationErrors, setShowValidationErrors] = useState(false)

    useEffect(() => {
        if (journeyParams) {
            const numberOfMessages =
                (journeyParams.max_follow_up_messages ?? 0) + 1
            setNumberOfMessageValue(numberOfMessages)
            setIsDiscountEnabled(journeyParams.offer_discount || false)
            setDiscountValue(
                journeyParams.max_discount_percent?.toString() || '',
            )
            setDiscountCodeThreshold(
                journeyParams.discount_code_message_threshold ?? 1,
            )
            setIsImageEnabled(journeyParams.include_image || false)
        }
    }, [journeyParams])

    useEffect(() => {
        setPhoneNumberValue(currentPhoneNumber)
    }, [currentPhoneNumber])

    useEffect(() => {
        if (journeyData) {
            setCampaignTitleValue(journeyData?.campaign?.title)
            setIncludedAudienceListIds(
                journeyData.included_audience_list_ids ?? undefined,
            )
            setExcludedAudienceListIds(
                journeyData.excluded_audience_list_ids ?? undefined,
            )
        }
    }, [journeyData])

    const handleCampaignTitleChange = (newValue: string) => {
        setCampaignTitleValue(newValue)
    }

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

    const handleIncludedAudienceListIds = (newValue: string[]) => {
        setIncludedAudienceListIds(newValue)
    }

    const handleExcludedAudienceListIds = (newValue: string[]) => {
        setExcludedAudienceListIds(newValue)
    }

    const handleCreate = useCallback(async () => {
        setIsLoadingHandleCreate(true)
        try {
            if (!integrationId || !currentIntegration?.name) {
                throw new Error(
                    `Missing integration information: ID: ${integrationId}, name: ${currentIntegration?.name}`,
                )
            }

            return await createNewJourney.mutateAsync({
                params: {
                    store_integration_id: currentIntegration.id,
                    store_name: currentIntegration.name,
                    type: JOURNEY_TYPE_MAP_FROM_URL[journeyType],
                    campaign: campaignTitleValue
                        ? {
                              title: campaignTitleValue,
                          }
                        : undefined,
                    included_audience_list_ids: includedAudienceListIds,
                    excluded_audience_list_ids: excludedAudienceListIds,
                },
                journeyConfigs: {
                    max_follow_up_messages: numberOfMessageValue - 1,
                    offer_discount: isDiscountEnabled,
                    max_discount_percent: isDiscountEnabled
                        ? Number(discountValue)
                        : undefined,
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
        } finally {
            setIsLoadingHandleCreate(false)
        }
    }, [
        currentIntegration,
        journeyType,
        isDiscountEnabled,
        numberOfMessageValue,
        createNewJourney,
        phoneNumberValue,
        discountValue,
        campaignTitleValue,
        includedAudienceListIds,
        discountCodeThreshold,
        dispatch,
        integrationId,
        excludedAudienceListIds,
    ])

    const {
        handleUpdate,
        isLoading: isLoadingHandleUpdate,
        isSuccess: isSuccessHandleUpdate,
    } = useJourneyUpdateHandler({
        integrationId,
        journeyId: journeyData?.id,
        followUpValue: numberOfMessageValue - 1,
        isDiscountEnabled,
        discountValue,
        phoneNumberValue,
        discountCodeThresholdValue: isDiscountEnabled
            ? discountCodeThreshold
            : undefined,
        includeImage: isImageEnabled,
    })

    const shouldDisableButton = useMemo(() => {
        // Common validations
        if (
            !phoneNumberValue ||
            isLoadingHandleUpdate ||
            isSuccessHandleUpdate ||
            isLoadingHandleCreate
        ) {
            return true
        }

        const isDiscountFieldValid = isDiscountEnabled
            ? !!discountValue && isDiscountValueValid
            : true

        if (!isDiscountFieldValid) {
            return true
        }

        // Journey-specific validations
        if (journeyType === JOURNEY_TYPES.CAMPAIGN) {
            // For campaigns: require title and includeAudience
            if (
                !campaignTitleValue ||
                !includedAudienceListIds ||
                includedAudienceListIds.length === 0
            ) {
                return true
            }
        } else {
            // For other journeys: require total messages to send
            if (!numberOfMessageValue || numberOfMessageValue < 1) {
                return true
            }
        }

        return false
    }, [
        phoneNumberValue,
        isLoadingHandleUpdate,
        isSuccessHandleUpdate,
        isLoadingHandleCreate,
        isDiscountEnabled,
        discountValue,
        isDiscountValueValid,
        journeyType,
        campaignTitleValue,
        includedAudienceListIds,
        numberOfMessageValue,
    ])
    const showMessageWithDiscountCode =
        isDiscountEnabled && numberOfMessageValue > 1

    const handleContinue = useCallback(async () => {
        if (shouldDisableButton) {
            setShowValidationErrors(true)
            return
        }

        try {
            if (journeyData) {
                await handleUpdate({
                    journeyMessageInstructions:
                        journeyData.message_instructions,
                    journeyState: journeyData.state,
                    campaignTitle: campaignTitleValue,
                    includedAudienceListIds: includedAudienceListIds,
                    excludedAudienceListIds: excludedAudienceListIds,
                })
                setIsVisible(false)
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/test/${journeyData.id}`,
                )
            } else {
                const createdJourney = await handleCreate()
                setIsVisible(false)
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/test/${createdJourney.id}`,
                )
            }
        } catch {
            return // Error handling is done in the handleUpdate and handleCreate functions
        }
    }, [
        handleCreate,
        shouldDisableButton,
        setShowValidationErrors,
        handleUpdate,
        history,
        setIsVisible,
        journeyData,
        campaignTitleValue,
        includedAudienceListIds,
        excludedAudienceListIds,
        journeyType,
        shopName,
    ])

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
            {fields.includes(Fields.CampaignTitle) && (
                <CampaignTitle
                    value={campaignTitleValue}
                    onChange={handleCampaignTitleChange}
                    showError={showValidationErrors}
                />
            )}
            <PhoneNumberField
                options={marketingCapabilityPhoneNumbers}
                value={phoneNumberValue}
                onChange={handlePhoneNumberChange}
                showError={showValidationErrors}
            />
            {fields.includes(Fields.FollowUps) && (
                <MessagesToSendField
                    value={numberOfMessageValue}
                    onChange={handleNumberOfMessageChange}
                />
            )}
            {fields.includes(Fields.SendImage) && smsImagesEnabled && (
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
                    showError={showValidationErrors}
                />
            )}

            {fields.includes(Fields.FollowUps) &&
                showMessageWithDiscountCode && (
                    <MessageWithDiscountCodeField
                        value={discountCodeThreshold}
                        numberOfMessages={numberOfMessageValue}
                        onChange={setDiscountCodeThreshold}
                    />
                )}

            {fields.includes(Fields.IncludeAudience) && (
                <AudienceSelect
                    name="Audience to include"
                    value={includedAudienceListIds ?? []}
                    exclude={excludedAudienceListIds ?? []}
                    onChange={handleIncludedAudienceListIds}
                    required
                    showError={showValidationErrors}
                />
            )}

            {fields.includes(Fields.ExcludeAudience) && (
                <AudienceSelect
                    name="Audience to exclude"
                    value={excludedAudienceListIds ?? []}
                    exclude={includedAudienceListIds ?? []}
                    onChange={handleExcludedAudienceListIds}
                />
            )}

            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={
                        journeyType === JOURNEY_TYPES.CAMPAIGN
                            ? `/app/ai-journey/${shopName}/campaigns`
                            : `/app/ai-journey/${shopName}`
                    }
                    label="Cancel"
                />
                <Button
                    label="Continue"
                    onClick={handleContinue}
                    isDisabled={
                        isLoadingHandleUpdate ||
                        isSuccessHandleUpdate ||
                        isLoadingHandleCreate
                    }
                />
            </div>
        </motion.div>
    )
}
