import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { UseFormReset, UseFormSetValue } from 'react-hook-form'

import type {
    PostPurchaseJourneyConfigurationApiDTO,
    WelcomeFlowConfigurationApiDTO,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { OrderStatusEnum } from '@gorgias/convert-client'

import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'

import { useAiJourneyStoreConfiguration } from '../useAiJourneyStoreConfiguration/useAiJourneyStoreConfiguration'

type UseSetupFormInitParams = {
    reset: UseFormReset<SetupFormValues>
    setValue: UseFormSetValue<SetupFormValues>
}

export const useSetupFormInit = ({
    reset,
    setValue,
}: UseSetupFormInitParams) => {
    const {
        isLoading: isLoadingJourneyData,
        journeyData,
        currentIntegration,
    } = useJourneyContext()
    const { configuration: journeyParams } = journeyData || {}
    const [isFormReady, setIsFormReady] = useState(false)

    const storeSettingsEnabled = useFlag(
        FeatureFlagKey.AiJourneyStoreSettingsEnabled,
    )
    const { storeConfiguration, isLoading: isLoadingStoreConfig } =
        useAiJourneyStoreConfiguration(currentIntegration?.id)

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
                        journeyParams.max_follow_up_messages ?? 0,
                    follow_up_wait_minutes:
                        journeyParams.follow_up_wait_minutes ?? 24 * 60,
                    include_image: journeyParams.include_image ?? false,
                    include_custom_image: !!hasCustomImage,
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
                    narrow_audience_enabled:
                        (journeyData?.included_audience_list_ids?.length ?? 0) >
                            0 ||
                        (journeyData?.excluded_audience_list_ids?.length ?? 0) >
                            0,
                    campaignTitle: journeyData?.campaign?.title ?? undefined,
                    rcs_enabled:
                        journeyData?.configuration?.rcs_enabled ?? undefined,
                    execution_mode_override:
                        journeyData?.execution_mode_override ?? null,
                    flowName: journeyData?.name ?? undefined,
                    journeyName: journeyData?.name ?? undefined,
                    timing_offset:
                        (
                            journeyData as unknown as {
                                timing_offset?: number
                            }
                        )?.timing_offset ?? 0,
                    message_instructions:
                        journeyData?.message_instructions ?? '',
                    variants: journeyData?.variants ?? [],
                })
            } else if (storeSettingsEnabled && storeConfiguration) {
                setValue('sms_sender_integration_id', {
                    id: storeConfiguration.sms_sender_integration_id,
                    label: storeConfiguration.sms_sender_number,
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
        setValue,
    ])

    return { isFormReady, storeSettingsEnabled }
}
