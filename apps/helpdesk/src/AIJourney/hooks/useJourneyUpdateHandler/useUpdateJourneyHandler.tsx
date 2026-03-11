import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
    CampaignJourneyConfigurationApiDTO,
    JourneyConfigurationApiDTO,
    JourneyStatusEnum,
    PatchJourneyBody,
    PostPurchaseJourneyConfigurationApiDTO,
    WelcomeFlowConfigurationApiDTO,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'

import type { UploadedImageAttachment } from 'AIJourney/components/ImageDropzone/ImageDropzone'
import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import { useUpdateJourney } from 'AIJourney/queries'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UseJourneyUpdateHandlerParams = {
    integrationId?: number
    journeyId?: string
}

type HandleUpdateParams = {
    campaignState?: UpdatableJourneyCampaignState
    campaignTitle?: string
    discountCodeThresholdValue?: number | null | undefined
    discountValue?: number | null | undefined
    excludedAudienceListIds?: string[]
    followUpValue?: number
    id?: string
    includeImage?: boolean
    includedAudienceListIds?: string[]
    isDiscountEnabled?: boolean
    journeyMessageInstructions?: string | null
    journeyState?: JourneyStatusEnum
    phoneNumberIntegrationId?: number | null | undefined
    phoneNumber?: string | null | undefined
    inactiveDays?: number | null
    cooldownDays?: number | null
    waitTimeMinutes?: number
    targetOrderStatus?: 'order_placed' | 'order_fulfilled'
    postPurchaseWaitMinutes?: number
    uploadedImageAttachment?: UploadedImageAttachment[]
}

export const useJourneyUpdateHandler = ({
    integrationId,
    journeyId,
}: UseJourneyUpdateHandlerParams) => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const updateJourney = useUpdateJourney()

    const handleUpdate = useCallback(
        async (updateParams: HandleUpdateParams) => {
            try {
                const entityId = updateParams.id || journeyId

                if (!integrationId) {
                    throw new Error(`Missing integration`)
                }

                if (!entityId) {
                    throw new Error(`Missing journey`)
                }

                const baseJourneyConfigs = {
                    max_follow_up_messages: updateParams.followUpValue,
                    offer_discount: updateParams.isDiscountEnabled,
                    max_discount_percent: updateParams.discountValue
                        ? Number(updateParams.discountValue)
                        : undefined,
                    sms_sender_integration_id:
                        updateParams.phoneNumberIntegrationId,
                    sms_sender_number: updateParams.phoneNumber,
                    discount_code_message_threshold:
                        updateParams.discountCodeThresholdValue,
                    include_image: updateParams.includeImage,
                }

                const optionalConfigs = {
                    ...(updateParams.inactiveDays !== undefined && {
                        inactive_days: updateParams.inactiveDays,
                    }),
                    ...(updateParams.cooldownDays !== undefined && {
                        cooldown_days: updateParams.cooldownDays,
                    }),
                    ...(updateParams.waitTimeMinutes !== undefined && {
                        wait_time_minutes: updateParams.waitTimeMinutes,
                    }),
                    ...(updateParams.postPurchaseWaitMinutes !== undefined && {
                        post_purchase_wait_minutes:
                            updateParams.postPurchaseWaitMinutes,
                    }),
                    ...(updateParams.targetOrderStatus && {
                        target_order_status: updateParams.targetOrderStatus,
                    }),
                    media_urls: updateParams.uploadedImageAttachment,
                }

                const journeyConfigs:
                    | JourneyConfigurationApiDTO
                    | WinbackJourneyConfigurationApiDTO
                    | CampaignJourneyConfigurationApiDTO
                    | WelcomeFlowConfigurationApiDTO
                    | PostPurchaseJourneyConfigurationApiDTO = {
                    ...baseJourneyConfigs,
                    ...optionalConfigs,
                }

                const shouldUpdateConfigs = Object.values(journeyConfigs).some(
                    (value) => value !== undefined && value !== null,
                )

                const requestBody = {
                    journeyId: entityId,
                    params: {
                        state: updateParams.journeyState,
                        message_instructions:
                            updateParams.journeyMessageInstructions,
                        included_audience_list_ids:
                            updateParams.includedAudienceListIds,
                        excluded_audience_list_ids:
                            updateParams.excludedAudienceListIds,
                        campaign:
                            updateParams.campaignTitle ||
                            updateParams.campaignState
                                ? ({
                                      title: updateParams.campaignTitle,
                                      state: updateParams.campaignState,
                                  } as PatchJourneyBody)
                                : undefined,
                    },
                    ...(shouldUpdateConfigs && { journeyConfigs }),
                }

                const updateJourneyMutate =
                    await updateJourney.mutateAsync(requestBody)

                await queryClient.invalidateQueries({
                    queryKey: aiJourneyKeys.all(),
                })

                return updateJourneyMutate
            } catch (error) {
                void dispatch(
                    notify({
                        message: `Error updating journey: ${error}`,
                        status: NotificationStatus.Error,
                    }),
                )
                throw error
            }
        },
        [dispatch, integrationId, journeyId, queryClient, updateJourney],
    )

    return {
        handleUpdate,
        isLoading: updateJourney.isLoading,
        isSuccess: updateJourney.isSuccess,
    }
}
