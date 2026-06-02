import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import type { JourneyParticipationExecutionMode } from '@gorgias/convert-client'

import type { UploadedImageAttachment } from 'AIJourney/components/ImageDropzone/ImageDropzone'
import type { JOURNEY_TYPES } from 'AIJourney/constants'
import { JOURNEY_TYPE_MAP_FROM_URL } from 'AIJourney/constants'
import { useCreateNewJourney } from 'AIJourney/queries'
import { aiJourneyKeys } from 'AIJourney/queries/utils'

type UseJourneyCreateHandlerParams = {
    integrationId?: number
    integrationName?: string
    journeyType: JOURNEY_TYPES
}

type HandleCreateParams = {
    campaignTitle?: string
    discountCodeThresholdValue?: number | null
    discountValue?: number | null
    excludedAudienceListIds?: string[]
    flowName?: string
    journeyName?: string
    timingOffset?: number
    followUpValue?: number | null
    includedAudienceListIds?: string[]
    includeImage?: boolean
    isDiscountEnabled?: boolean
    journeyMessageInstructions?: string | null
    phoneNumberIntegrationId?: number | null | undefined
    phoneNumber?: string | null | undefined
    inactiveDays?: number | null
    cooldownDays?: number | null
    waitTimeMinutes?: number
    followUpWaitMinutes?: number
    targetOrderStatus?: 'order_placed' | 'order_fulfilled'
    postPurchaseWaitMinutes?: number
    uploadedImageAttachment?: UploadedImageAttachment[]
    rcsEnabled?: boolean
    executionModeOverride?: JourneyParticipationExecutionMode | null
    scheduledDatetime?: string | null
}

export const useJourneyCreateHandler = ({
    integrationId,
    integrationName,
    journeyType,
}: UseJourneyCreateHandlerParams) => {
    const queryClient = useQueryClient()
    const createNewJourney = useCreateNewJourney()

    const handleCreate = useCallback(
        async ({
            campaignTitle,
            discountCodeThresholdValue,
            discountValue,
            excludedAudienceListIds,
            flowName,
            journeyName,
            timingOffset,
            followUpValue,
            includedAudienceListIds,
            includeImage,
            isDiscountEnabled,
            journeyMessageInstructions,
            phoneNumberIntegrationId,
            phoneNumber,
            inactiveDays,
            cooldownDays,
            waitTimeMinutes,
            followUpWaitMinutes,
            targetOrderStatus,
            postPurchaseWaitMinutes,
            uploadedImageAttachment,
            rcsEnabled,
            executionModeOverride,
            scheduledDatetime,
        }: HandleCreateParams) => {
            try {
                if (!integrationId || !integrationName) {
                    throw new Error(
                        `Missing integration information: ID: ${integrationId}, name: ${integrationName}`,
                    )
                }

                const baseJourneyConfigs = {
                    max_follow_up_messages: followUpValue,
                    offer_discount: isDiscountEnabled,
                    max_discount_percent: discountValue
                        ? Number(discountValue)
                        : undefined,
                    sms_sender_integration_id: phoneNumberIntegrationId,
                    sms_sender_number: phoneNumber,
                    discount_code_message_threshold: isDiscountEnabled
                        ? discountCodeThresholdValue
                        : undefined,
                    include_image: includeImage,
                }

                const optionalConfigs = {
                    ...(inactiveDays !== undefined && {
                        inactive_days: inactiveDays,
                    }),
                    ...(cooldownDays !== undefined && {
                        cooldown_days: cooldownDays,
                    }),
                    ...(waitTimeMinutes !== undefined && {
                        wait_time_minutes: waitTimeMinutes,
                    }),
                    ...(followUpWaitMinutes !== undefined && {
                        follow_up_wait_minutes: followUpWaitMinutes,
                    }),
                    ...(postPurchaseWaitMinutes !== undefined && {
                        post_purchase_wait_minutes: postPurchaseWaitMinutes,
                    }),
                    ...(targetOrderStatus && {
                        target_order_status: targetOrderStatus,
                    }),
                    ...(rcsEnabled !== undefined && {
                        rcs_enabled: rcsEnabled,
                    }),
                    media_urls: uploadedImageAttachment,
                }

                const createBody = {
                    params: {
                        store_integration_id: integrationId,
                        store_name: integrationName,
                        type: JOURNEY_TYPE_MAP_FROM_URL[journeyType],
                        message_instructions: journeyMessageInstructions,
                        campaign: campaignTitle
                            ? {
                                  title: campaignTitle,
                                  ...(scheduledDatetime !== undefined && {
                                      scheduled_datetime: scheduledDatetime,
                                  }),
                              }
                            : undefined,
                        included_audience_list_ids: includedAudienceListIds,
                        excluded_audience_list_ids: excludedAudienceListIds,
                        ...(executionModeOverride !== undefined && {
                            execution_mode_override: executionModeOverride,
                        }),
                        ...(flowName !== undefined && { name: flowName }),
                        ...(journeyName !== undefined && {
                            name: journeyName,
                        }),
                        ...(timingOffset !== undefined && {
                            timing_offset: timingOffset,
                        }),
                    },
                    journeyConfigs: {
                        ...baseJourneyConfigs,
                        ...optionalConfigs,
                    },
                }
                const result = await createNewJourney.mutateAsync(createBody)

                await queryClient.invalidateQueries({
                    queryKey: aiJourneyKeys.all(),
                })

                return result
            } catch (error) {
                toast.error(`Error creating new journey: ${error}`)
                throw error
            }
        },
        [
            createNewJourney,
            integrationId,
            integrationName,
            journeyType,
            queryClient,
        ],
    )

    return {
        handleCreate,
        isLoading: createNewJourney.isLoading,
        isSuccess: createNewJourney.isSuccess,
    }
}
