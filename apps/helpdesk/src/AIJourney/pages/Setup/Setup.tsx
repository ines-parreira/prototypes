import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { Button } from 'AIJourney/components'
import { JOURNEY_TYPES, POST_PURCHASE_MAX_WAIT_TIME } from 'AIJourney/constants'
import {
    useAiJourneyPhoneList,
    useJourneyCreateHandler,
    useJourneyUpdateHandler,
} from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import type { NewPhoneNumber } from 'models/phoneNumber/types'

import {
    EnableDiscountField,
    EnableImageField,
    MaximumDiscountField,
    MessagesToSendField,
    MessageWithDiscountCodeField,
    PhoneNumberField,
    TargetOrderStatusField,
    UploadImageField,
    WaitTimeField,
} from './fields'
import { AudienceSelect } from './fields/AudienceSelect/AudienceSelect'
import { CampaignTitle } from './fields/CampaignTitle/CampaignTitle'
import type { UploadedImageAttachment } from './fields/UploadImage/UploadImage'
import { WinbackReengagementRulesField } from './fields/WinbackReengagementRules/WinbackReengagementRules'

import css from './Setup.less'

const Fields = {
    CampaignTitle: 'campaign_title',
    FollowUps: 'followups',
    SendImage: 'send_image',
    UploadImage: 'upload_image',
    IncludeAudience: 'include_audience',
    ExcludeAudience: 'exclude_audience',
    InactiveDays: 'inactive_days',
    CoolDownDays: 'cooldown_days',
    WaitTime: 'wait_time',
    TargetOrderStatus: 'target_order_status',
    PostPurchaseWaitTime: 'post_purchase_wait_time',
}

type Fields = (typeof Fields)[keyof typeof Fields]

export const JOURNEY_TYPES_TO_FIELDS: Record<JOURNEY_TYPES, Fields[]> = {
    [JOURNEY_TYPES.SESSION_ABANDONMENT]: [Fields.FollowUps, Fields.SendImage],
    [JOURNEY_TYPES.CART_ABANDONMENT]: [Fields.FollowUps, Fields.SendImage],
    [JOURNEY_TYPES.WIN_BACK]: [
        Fields.FollowUps,
        Fields.SendImage,
        Fields.CoolDownDays,
        Fields.InactiveDays,
    ],
    [JOURNEY_TYPES.CAMPAIGN]: [
        Fields.CampaignTitle,
        Fields.IncludeAudience,
        Fields.ExcludeAudience,
        Fields.UploadImage,
    ],
    [JOURNEY_TYPES.WELCOME]: [Fields.FollowUps, Fields.WaitTime],
    [JOURNEY_TYPES.POST_PURCHASE]: [
        Fields.TargetOrderStatus,
        Fields.PostPurchaseWaitTime,
        Fields.FollowUps,
        Fields.SendImage,
    ],
}

type SetupProps = {
    journeyType: JOURNEY_TYPES
}

export const Setup = ({ journeyType }: SetupProps) => {
    const history = useHistory()
    const [isVisible, setIsVisible] = useState(true)
    const smsImagesEnabled = useFlag(FeatureFlagKey.AiJourneySmsImagesEnabled)
    const campaignImageEnabled = useFlag(
        FeatureFlagKey.AiJourneyCampaignImageEnabled,
    )

    const {
        campaigns,
        currentIntegration,
        isLoading: isLoadingJourneyData,
        journeyData,
        shopName,
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
    const [uploadedImageAttachment, setUploadedImageAttachment] = useState<
        UploadedImageAttachment | undefined
    >(undefined)

    const [includedAudienceListIds, setIncludedAudienceListIds] = useState<
        string[] | undefined
    >()
    const [excludedAudienceListIds, setExcludedAudienceListIds] = useState<
        string[] | undefined
    >()
    const [inactiveDays, setInactiveDays] = useState<number>()
    const [cooldownDays, setCooldownDays] = useState<number | null>()
    const [waitTimeMinutes, setWaitTimeMinutes] = useState<number | undefined>()
    const [targetOrderStatus, setTargetOrderStatus] = useState<
        'order_placed' | 'order_fulfilled'
    >()
    const [postPurchaseWaitMinutes, setPostPurchaseWaitMinutes] = useState<
        number | undefined
    >()
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

            if ('media_urls' in journeyParams && journeyParams.media_urls) {
                const firstMedia = journeyParams.media_urls[0]
                if (firstMedia) {
                    setUploadedImageAttachment({
                        url: firstMedia.url,
                        name: firstMedia.name,
                        content_type: firstMedia.content_type,
                    })
                }
            }

            if ('cooldown_days' in journeyParams) {
                setCooldownDays(journeyParams.cooldown_days ?? 30)
            }
            if ('inactive_days' in journeyParams) {
                setInactiveDays(journeyParams.inactive_days ?? 30)
            }
            if ('wait_time_minutes' in journeyParams) {
                setWaitTimeMinutes(journeyParams.wait_time_minutes ?? 0)
            }
            if ('target_order_status' in journeyParams) {
                setTargetOrderStatus(
                    journeyParams.target_order_status ?? 'order_placed',
                )
            }
            if ('post_purchase_wait_minutes' in journeyParams) {
                setPostPurchaseWaitMinutes(
                    journeyParams.post_purchase_wait_minutes ?? 1440,
                )
            }
        }
    }, [journeyParams, journeyType])

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

    const handleUploadedImageChange = (
        attachment: UploadedImageAttachment | undefined,
    ) => {
        setUploadedImageAttachment(attachment)
    }

    const handleIncludedAudienceListIds = (newValue: string[]) => {
        setIncludedAudienceListIds(newValue)
    }

    const handleExcludedAudienceListIds = (newValue: string[]) => {
        setExcludedAudienceListIds(newValue)
    }

    const handleUpdateInactiveDays = (newValue: number) => {
        setInactiveDays(newValue)
    }

    const handleUpdateCooldownDays = (newValue: number | null) => {
        setCooldownDays(newValue)
    }

    const handleUpdateWaitTimeMinutes = (newValue?: number) => {
        setWaitTimeMinutes(newValue)
    }

    const handleUpdateTargetOrderStatus = (
        newValue: 'order_placed' | 'order_fulfilled',
    ) => {
        setTargetOrderStatus(newValue)
    }

    const handleUpdatePostPurchaseWaitMinutes = (newValue?: number) => {
        setPostPurchaseWaitMinutes(newValue)
    }

    const {
        handleCreate,
        isLoading: isLoadingHandleCreate,
        isSuccess: isSuccessHandleCreate,
    } = useJourneyCreateHandler({
        integrationId,
        integrationName: currentIntegration?.name,
        journeyType,
    })

    const {
        handleUpdate,
        isLoading: isLoadingHandleUpdate,
        isSuccess: isSuccessHandleUpdate,
    } = useJourneyUpdateHandler({
        integrationId,
        journeyId: journeyData?.id,
    })

    const shouldDisableButton = useMemo(() => {
        // Common validations
        if (
            !phoneNumberValue ||
            isLoadingHandleUpdate ||
            isSuccessHandleUpdate ||
            isLoadingHandleCreate ||
            isSuccessHandleCreate
        ) {
            return true
        }

        const isDiscountFieldValid = isDiscountEnabled
            ? !!discountValue && isDiscountValueValid
            : true

        if (!isDiscountFieldValid) {
            return true
        }

        // Validate wait time for WELCOME journey
        if (journeyType === JOURNEY_TYPES.WELCOME) {
            if (waitTimeMinutes === undefined) {
                return true
            }
            if (waitTimeMinutes > POST_PURCHASE_MAX_WAIT_TIME) {
                return true
            }
        }

        // Validate wait time for POST_PURCHASE journey
        if (journeyType === JOURNEY_TYPES.POST_PURCHASE) {
            if (postPurchaseWaitMinutes === undefined) {
                return true
            }
            if (postPurchaseWaitMinutes > POST_PURCHASE_MAX_WAIT_TIME) {
                return true
            }
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
        isSuccessHandleCreate,
        isDiscountEnabled,
        discountValue,
        isDiscountValueValid,
        journeyType,
        campaignTitleValue,
        includedAudienceListIds,
        numberOfMessageValue,
        postPurchaseWaitMinutes,
        waitTimeMinutes,
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
                    campaignTitle: campaignTitleValue,
                    discountCodeThresholdValue: isDiscountEnabled
                        ? discountCodeThreshold
                        : undefined,
                    discountValue,
                    excludedAudienceListIds,
                    followUpValue: numberOfMessageValue - 1,
                    includeImage: isImageEnabled,
                    includedAudienceListIds,
                    isDiscountEnabled,
                    journeyMessageInstructions:
                        journeyData.message_instructions,
                    journeyState: journeyData.state,
                    phoneNumberValue,
                    inactiveDays,
                    cooldownDays,
                    waitTimeMinutes,
                    targetOrderStatus,
                    postPurchaseWaitMinutes,
                    uploadedImageAttachment,
                })
                setIsVisible(false)
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/test/${journeyData.id}`,
                )
            } else {
                const createdJourney = await handleCreate({
                    campaignTitle: campaignTitleValue,
                    discountCodeThresholdValue: isDiscountEnabled
                        ? discountCodeThreshold
                        : undefined,
                    discountValue,
                    excludedAudienceListIds,
                    followUpValue: numberOfMessageValue - 1,
                    includedAudienceListIds,
                    includeImage: isImageEnabled,
                    isDiscountEnabled,
                    phoneNumberValue,
                    inactiveDays,
                    cooldownDays,
                    waitTimeMinutes,
                    targetOrderStatus,
                    postPurchaseWaitMinutes,
                    uploadedImageAttachment,
                })
                setIsVisible(false)
                history.push(
                    `/app/ai-journey/${shopName}/${journeyType}/test/${createdJourney.id}`,
                )
            }
        } catch {
            return
        }
    }, [
        campaignTitleValue,
        discountCodeThreshold,
        discountValue,
        excludedAudienceListIds,
        handleCreate,
        handleUpdate,
        history,
        includedAudienceListIds,
        isDiscountEnabled,
        isImageEnabled,
        journeyData,
        journeyType,
        numberOfMessageValue,
        phoneNumberValue,
        setIsVisible,
        setShowValidationErrors,
        shopName,
        shouldDisableButton,
        inactiveDays,
        cooldownDays,
        waitTimeMinutes,
        targetOrderStatus,
        postPurchaseWaitMinutes,
        uploadedImageAttachment,
    ])

    const getRedirectLinkOnCancel = () => {
        if (journeyType === JOURNEY_TYPES.CAMPAIGN && campaigns?.length)
            return `/app/ai-journey/${shopName}/campaigns`

        return `/app/ai-journey/${shopName}`
    }

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
            {fields.includes(Fields.UploadImage) && campaignImageEnabled && (
                <UploadImageField
                    imageUrl={uploadedImageAttachment?.url}
                    onChange={handleUploadedImageChange}
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

            {fields.includes(Fields.WaitTime) && (
                <WaitTimeField
                    value={waitTimeMinutes}
                    onChange={handleUpdateWaitTimeMinutes}
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

            {fields.includes(Fields.InactiveDays) && (
                <WinbackReengagementRulesField
                    type="inactive_days"
                    value={inactiveDays}
                    onChange={handleUpdateInactiveDays}
                />
            )}

            {fields.includes(Fields.CoolDownDays) && (
                <WinbackReengagementRulesField
                    type="cooldown_days"
                    value={cooldownDays}
                    onChange={handleUpdateCooldownDays}
                />
            )}

            {fields.includes(Fields.TargetOrderStatus) && (
                <TargetOrderStatusField
                    value={targetOrderStatus}
                    onChange={handleUpdateTargetOrderStatus}
                />
            )}

            {fields.includes(Fields.PostPurchaseWaitTime) && (
                <WaitTimeField
                    title="Wait time after trigger"
                    description="Time in minutes to wait after the order status changes before sending the first message"
                    value={postPurchaseWaitMinutes}
                    onChange={handleUpdatePostPurchaseWaitMinutes}
                />
            )}

            <div className={css.buttonsContainer}>
                <Button
                    variant="link"
                    redirectLink={getRedirectLinkOnCancel()}
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
