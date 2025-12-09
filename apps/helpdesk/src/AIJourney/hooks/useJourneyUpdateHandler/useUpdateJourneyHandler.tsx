import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
    CampaignUpdateApiDTO,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import { useUpdateJourney } from 'AIJourney/queries'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import type { CartAbandonedJourneyConfigurationApiDTO } from 'rest_api/revenue_addon_api/client'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UseJourneyActionsParams = {
    journeyId?: string
    integrationId?: number
    followUpValue?: number
    isDiscountEnabled?: boolean
    discountValue?: string
    phoneNumberValue?: NewPhoneNumber
    discountCodeThresholdValue?: number
    includeImage?: boolean
}

export const useJourneyUpdateHandler = ({
    journeyId,
    integrationId,
    followUpValue,
    isDiscountEnabled,
    discountValue,
    phoneNumberValue,
    discountCodeThresholdValue,
    includeImage,
}: UseJourneyActionsParams) => {
    const queryClient = useQueryClient()

    const dispatch = useAppDispatch()
    const updateJourney = useUpdateJourney()

    const handleUpdate = useCallback(
        async ({
            id,
            journeyState,
            journeyMessageInstructions,
            campaignTitle,
            campaignState,
            includedAudienceListIds,
            excludedAudienceListIds,
        }: {
            id?: string
            journeyState?: JourneyStatusEnum
            journeyMessageInstructions?: string | null
            campaignTitle?: string
            campaignState?: UpdatableJourneyCampaignState
            includedAudienceListIds?: string[]
            excludedAudienceListIds?: string[]
        }) => {
            try {
                const entityId = id || journeyId

                if (phoneNumberValue && !integrationId) {
                    throw new Error(`Missing integration`)
                }

                if (!entityId) {
                    throw new Error(`Missing journey`)
                }

                const smsIntegrationId = phoneNumberValue?.integrations.find(
                    (integration) => integration.type === 'sms',
                )?.id

                const journeyConfigs: CartAbandonedJourneyConfigurationApiDTO =
                    {
                        max_follow_up_messages: followUpValue,
                        offer_discount: isDiscountEnabled,
                        max_discount_percent:
                            isDiscountEnabled && discountValue
                                ? Number(discountValue)
                                : 0,
                        sms_sender_integration_id: smsIntegrationId,
                        sms_sender_number: phoneNumberValue?.phone_number,
                        discount_code_message_threshold:
                            discountCodeThresholdValue,
                        include_image: includeImage,
                    }

                const shouldUpdateConfigs = Object.values(journeyConfigs).some(
                    (value) => value !== undefined && value !== null,
                )

                const requestBody = {
                    journeyId: entityId,
                    params: {
                        state: journeyState,
                        message_instructions: journeyMessageInstructions,
                        included_audience_list_ids: includedAudienceListIds,
                        excluded_audience_list_ids: excludedAudienceListIds,
                        campaign:
                            campaignTitle || campaignState
                                ? ({
                                      title: campaignTitle,
                                      state: campaignState,
                                  } as CampaignUpdateApiDTO)
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
        [
            journeyId,
            integrationId,
            followUpValue,
            isDiscountEnabled,
            discountValue,
            phoneNumberValue,
            discountCodeThresholdValue,
            includeImage,
            updateJourney,
            dispatch,
            queryClient,
        ],
    )

    return {
        handleUpdate,
        isLoading: updateJourney.isLoading,
        isSuccess: updateJourney.isSuccess,
    }
}
