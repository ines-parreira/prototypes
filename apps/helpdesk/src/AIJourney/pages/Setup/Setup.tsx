import { useEffect, useState } from 'react'

import type {
    CalendarDateTime,
    Time,
    ZonedDateTime,
} from '@internationalized/date'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useFormContext } from 'react-hook-form'

import { Box } from '@gorgias/axiom'
import type {
    JourneyParticipationExecutionMode,
    PostPurchaseJourneyConfigurationApiDTO,
    WelcomeFlowConfigurationApiDTO,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { OrderStatusEnum } from '@gorgias/convert-client'

import {
    AudienceCard,
    DiscountCodeCard,
    ExecutionModeCard,
    GeneralCard,
    KlaviyoSetupCard,
    RcsEnabledCard,
    TimingCard,
} from 'AIJourney/components'
import type { UploadedImageAttachment } from 'AIJourney/components/ImageDropzone/ImageDropzone'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useAiJourneyStoreConfiguration } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'

export type SetupFormValues = {
    sms_sender_integration_id?: {
        id: number | null | undefined
        label: string | null | undefined
    }
    max_follow_up_messages: number
    follow_up_wait_minutes?: number
    include_image?: boolean
    uploaded_image_attachment?: UploadedImageAttachment[]
    offer_discount?: boolean
    max_discount_percent?: number
    discount_code_message_threshold?: number
    target_order_status: OrderStatusEnum
    post_purchase_wait_minutes?: number
    wait_time_minutes?: number
    cooldown_days?: number
    inactive_days?: number
    message_instructions?: string
    included_audience_list_ids?: string[]
    excluded_audience_list_ids?: string[]
    campaignTitle?: string
    rcs_enabled?: boolean
    execution_mode_override?: JourneyParticipationExecutionMode | null
    scheduleType?: 'immediate' | 'later'
    scheduledDate?: ZonedDateTime | null
    scheduledTime?: Time | CalendarDateTime | ZonedDateTime | null
    flowName?: string
}

export const Setup = () => {
    const {
        isLoading: isLoadingJourneyData,
        journeyData,
        journeyType,
        currentIntegration,
    } = useJourneyContext()
    const { configuration: journeyParams } = journeyData || {}

    const { reset } = useFormContext<SetupFormValues>()
    const [isFormReady, setIsFormReady] = useState(false)

    const storeSettingsEnabled = useFlag(
        FeatureFlagKey.AiJourneyStoreSettingsEnabled,
    )
    const { storeConfiguration, isLoading: isLoadingStoreConfig } =
        useAiJourneyStoreConfiguration(currentIntegration?.id)

    const storeFallbackMode:
        | JourneyParticipationExecutionMode
        | null
        | undefined = isLoadingStoreConfig
        ? undefined
        : (storeConfiguration?.execution_mode_override ?? null)

    const isAiJourneySegmentsEnabled = useFlag(
        FeatureFlagKey.AiJourneySegmentsUiEnabled,
    )

    const isAiJourneyRcsEnabled = useFlag(FeatureFlagKey.AiJourneyRcsEnable)

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const isCustom = journeyType === JOURNEY_TYPES.CUSTOM
    const shouldRenderTimingCard = !isCampaign && !isCustom
    const shouldRenderAudienceCard = isCampaign
        ? true
        : isAiJourneySegmentsEnabled

    useEffect(() => {
        const isReadyToInit =
            !isLoadingJourneyData &&
            (!storeSettingsEnabled || !isLoadingStoreConfig)

        if (isReadyToInit && !isFormReady) {
            if (journeyParams) {
                const hasCustomImage =
                    'media_urls' in journeyParams &&
                    journeyParams.media_urls &&
                    journeyParams.media_urls.length > 0

                reset({
                    sms_sender_integration_id: {
                        id:
                            journeyParams.sms_sender_integration_id ??
                            (storeSettingsEnabled
                                ? storeConfiguration?.sms_sender_integration_id
                                : undefined),
                        label:
                            journeyParams.sms_sender_number ??
                            (storeSettingsEnabled
                                ? storeConfiguration?.sms_sender_number
                                : undefined),
                    },
                    max_follow_up_messages:
                        (journeyParams.max_follow_up_messages ?? 0) + 1,
                    follow_up_wait_minutes:
                        journeyParams.follow_up_wait_minutes ?? 24 * 60,
                    include_image: journeyParams.include_image ?? false,
                    uploaded_image_attachment: hasCustomImage
                        ? [
                              {
                                  url: journeyParams.media_urls![0].url,
                                  name: journeyParams.media_urls![0].name,
                                  content_type:
                                      journeyParams.media_urls![0].content_type,
                              },
                          ]
                        : undefined,
                    offer_discount: journeyParams.offer_discount ?? false,
                    max_discount_percent:
                        journeyParams.max_discount_percent ?? undefined,
                    discount_code_message_threshold:
                        journeyParams.discount_code_message_threshold ??
                        undefined,
                    target_order_status:
                        (
                            journeyParams as PostPurchaseJourneyConfigurationApiDTO
                        ).target_order_status ?? OrderStatusEnum.OrderFulfilled,
                    post_purchase_wait_minutes:
                        (
                            journeyParams as PostPurchaseJourneyConfigurationApiDTO
                        ).post_purchase_wait_minutes ?? undefined,
                    wait_time_minutes:
                        (journeyParams as WelcomeFlowConfigurationApiDTO)
                            .wait_time_minutes ?? undefined,
                    cooldown_days:
                        (journeyParams as WinbackJourneyConfigurationApiDTO)
                            .cooldown_days ?? undefined,
                    inactive_days:
                        (journeyParams as WinbackJourneyConfigurationApiDTO)
                            .inactive_days ?? undefined,
                    included_audience_list_ids:
                        journeyData?.included_audience_list_ids ?? undefined,
                    excluded_audience_list_ids:
                        journeyData?.excluded_audience_list_ids ?? undefined,
                    campaignTitle: journeyData?.campaign?.title ?? undefined,
                    rcs_enabled:
                        journeyData?.configuration?.rcs_enabled ?? undefined,
                    execution_mode_override:
                        journeyData?.execution_mode_override ?? null,
                    flowName: journeyData?.name ?? undefined,
                })
            } else if (storeSettingsEnabled && storeConfiguration) {
                reset({
                    sms_sender_integration_id: {
                        id: storeConfiguration.sms_sender_integration_id,
                        label: storeConfiguration.sms_sender_number,
                    },
                })
            }
            setIsFormReady(true)
        }
    }, [
        isLoadingJourneyData,
        isLoadingStoreConfig,
        isFormReady,
        storeSettingsEnabled,
        storeConfiguration,
        journeyData,
        journeyParams,
        reset,
    ])

    const webhookUrl = journeyData?.webhook_url ?? undefined
    const hasWebhookUrl = isCustom && !!webhookUrl

    return (
        <Box flexDirection="column" gap="lg">
            {shouldRenderTimingCard && (
                <TimingCard
                    isFormReady={isFormReady}
                    journeyType={journeyType}
                />
            )}
            {shouldRenderAudienceCard && (
                <AudienceCard isFormReady={isFormReady} />
            )}
            {hasWebhookUrl && <KlaviyoSetupCard webhookUrl={webhookUrl} />}
            {isAiJourneyRcsEnabled && window.USER_IMPERSONATED && (
                <RcsEnabledCard isFormReady={isFormReady} />
            )}
            {window.USER_IMPERSONATED && (
                <ExecutionModeCard
                    isFormReady={isFormReady}
                    storeFallbackMode={storeFallbackMode}
                    collapsible
                />
            )}
            <DiscountCodeCard isFormReady={isFormReady} />
            <GeneralCard isFormReady={isFormReady} />
        </Box>
    )
}
