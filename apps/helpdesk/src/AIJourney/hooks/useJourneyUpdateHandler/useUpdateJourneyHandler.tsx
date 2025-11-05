import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { JourneyApiDTO, JourneyStatusEnum } from '@gorgias/convert-client'

import { useUpdateJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { CartAbandonedJourneyConfigurationApiDTO } from 'rest_api/revenue_addon_api/client'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UseJourneyActionsParams = {
    integrationId?: number
    journey?: JourneyApiDTO
    followUpValue?: number
    isDiscountEnabled?: boolean
    discountValue?: string
    phoneNumberValue?: NewPhoneNumber
    discountCodeThresholdValue?: number
    includeImage?: boolean
    campaignTitle?: string
}

export const useJourneyUpdateHandler = ({
    integrationId,
    journey,
    followUpValue,
    isDiscountEnabled,
    discountValue,
    phoneNumberValue,
    discountCodeThresholdValue,
    includeImage,
    campaignTitle,
}: UseJourneyActionsParams) => {
    const queryClient = useQueryClient()

    const dispatch = useAppDispatch()
    const updateJourney = useUpdateJourney()

    const handleUpdate = useCallback(
        async ({
            journeyState,
            journeyMessageInstructions,
        }: {
            journeyState: JourneyStatusEnum
            journeyMessageInstructions?: string | null
        }) => {
            try {
                if (!integrationId || !journey?.id) {
                    throw new Error(
                        `Missing integration information: ID: ${integrationId}, journey ID: ${journey?.id}`,
                    )
                }

                const smsIntegrationId = phoneNumberValue?.integrations.find(
                    (integration) => integration.type === 'sms',
                )?.id

                const journeyConfigs: CartAbandonedJourneyConfigurationApiDTO =
                    {
                        max_follow_up_messages: followUpValue,
                        offer_discount: isDiscountEnabled,
                        max_discount_percent: discountValue
                            ? Number(discountValue)
                            : undefined,
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
                    journeyId: journey.id,
                    params: {
                        state: journeyState,
                        message_instructions: journeyMessageInstructions,
                        campaign: campaignTitle
                            ? {
                                  title: campaignTitle,
                              }
                            : undefined,
                    },
                    ...(shouldUpdateConfigs && { journeyConfigs }),
                }

                const updateJourneyMutate =
                    await updateJourney.mutateAsync(requestBody)

                await queryClient.invalidateQueries(['journeys', integrationId])

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
            integrationId,
            journey,
            followUpValue,
            isDiscountEnabled,
            discountValue,
            phoneNumberValue,
            discountCodeThresholdValue,
            includeImage,
            campaignTitle,
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
