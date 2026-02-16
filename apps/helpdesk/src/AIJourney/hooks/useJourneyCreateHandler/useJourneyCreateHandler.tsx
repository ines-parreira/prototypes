import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { JOURNEY_TYPES } from 'AIJourney/constants'
import { JOURNEY_TYPE_MAP_FROM_URL } from 'AIJourney/constants'
import type { UploadedImageAttachment } from 'AIJourney/pages/Setup/fields/UploadImage/UploadImage'
import { useCreateNewJourney } from 'AIJourney/queries'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UseJourneyCreateHandlerParams = {
    integrationId?: number
    integrationName?: string
    journeyType: JOURNEY_TYPES
}

type HandleCreateParams = {
    campaignTitle?: string
    discountCodeThresholdValue?: number
    discountValue?: string
    excludedAudienceListIds?: string[]
    followUpValue?: number
    includedAudienceListIds?: string[]
    includeImage?: boolean
    isDiscountEnabled?: boolean
    phoneNumberValue?: NewPhoneNumber
    inactiveDays?: number | null
    cooldownDays?: number | null
    waitTimeMinutes?: number
    targetOrderStatus?: 'order_placed' | 'order_fulfilled'
    postPurchaseWaitMinutes?: number
    uploadedImageAttachment?: UploadedImageAttachment
}

export const useJourneyCreateHandler = ({
    integrationId,
    integrationName,
    journeyType,
}: UseJourneyCreateHandlerParams) => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const createNewJourney = useCreateNewJourney()

    const handleCreate = useCallback(
        async ({
            campaignTitle,
            discountCodeThresholdValue,
            discountValue,
            excludedAudienceListIds,
            followUpValue,
            includedAudienceListIds,
            includeImage,
            isDiscountEnabled,
            phoneNumberValue,
            inactiveDays,
            cooldownDays,
            waitTimeMinutes,
            targetOrderStatus,
            postPurchaseWaitMinutes,
            uploadedImageAttachment,
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
                    sms_sender_integration_id:
                        phoneNumberValue?.integrations.find(
                            (integration) => integration.type === 'sms',
                        )?.id,
                    sms_sender_number: phoneNumberValue?.phone_number,
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
                    ...(postPurchaseWaitMinutes !== undefined && {
                        post_purchase_wait_minutes: postPurchaseWaitMinutes,
                    }),
                    ...(targetOrderStatus && {
                        target_order_status: targetOrderStatus,
                    }),
                    media_urls: uploadedImageAttachment
                        ? [uploadedImageAttachment]
                        : [],
                }

                const result = await createNewJourney.mutateAsync({
                    params: {
                        store_integration_id: integrationId,
                        store_name: integrationName,
                        type: JOURNEY_TYPE_MAP_FROM_URL[journeyType],
                        campaign: campaignTitle
                            ? {
                                  title: campaignTitle,
                              }
                            : undefined,
                        included_audience_list_ids: includedAudienceListIds,
                        excluded_audience_list_ids: excludedAudienceListIds,
                    },
                    journeyConfigs: {
                        ...baseJourneyConfigs,
                        ...optionalConfigs,
                    },
                })

                await queryClient.invalidateQueries({
                    queryKey: aiJourneyKeys.all(),
                })

                return result
            } catch (error) {
                void dispatch(
                    notify({
                        message: `Error creating new journey: ${error}`,
                        status: NotificationStatus.Error,
                    }),
                )
                throw error
            }
        },
        [
            createNewJourney,
            dispatch,
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
