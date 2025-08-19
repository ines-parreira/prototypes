import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    CartAbandonedJourneyConfigurationApiDTO,
    JourneyStatusEnum,
} from '@gorgias/convert-client'
import { Integration } from '@gorgias/helpdesk-types'

import { useUpdateJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UseJourneyActionsParams = {
    integrationId?: number
    currentIntegration?: Integration
    abandonedCartJourney?: { id: string }
    followUpValue?: number
    isDiscountEnabled?: boolean
    discountValue?: string
    phoneNumberValue?: NewPhoneNumber
    discountCodeThresholdValue?: number
    journeyMessageInstructions?: string
}

export const useJourneyUpdateHandler = ({
    integrationId,
    currentIntegration,
    abandonedCartJourney,
    followUpValue,
    isDiscountEnabled,
    discountValue,
    phoneNumberValue,
    discountCodeThresholdValue,
    journeyMessageInstructions,
}: UseJourneyActionsParams) => {
    const queryClient = useQueryClient()

    const dispatch = useAppDispatch()
    const updateJourney = useUpdateJourney()

    const handleUpdate = useCallback(
        async (journeyState?: JourneyStatusEnum) => {
            try {
                if (
                    !integrationId ||
                    !currentIntegration?.name ||
                    !abandonedCartJourney?.id
                ) {
                    throw new Error(
                        `Missing integration information: ID: ${integrationId}, name: ${currentIntegration?.name}, journey ID: ${abandonedCartJourney?.id}`,
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
                    }

                const shouldUpdateConfigs = Object.values(journeyConfigs).some(
                    (value) => value !== undefined && value !== null,
                )

                const requestBody = {
                    journeyId: abandonedCartJourney.id,
                    params: {
                        state: journeyState ?? JourneyStatusEnum.Active,
                        message_instructions:
                            journeyMessageInstructions || null,
                    },
                    ...(shouldUpdateConfigs && { journeyConfigs }),
                }

                const updateJourneyMutate =
                    await updateJourney.mutateAsync(requestBody)

                queryClient.invalidateQueries(['journeys', integrationId])

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
            currentIntegration,
            abandonedCartJourney,
            followUpValue,
            isDiscountEnabled,
            discountValue,
            phoneNumberValue,
            discountCodeThresholdValue,
            journeyMessageInstructions,
            updateJourney,
            dispatch,
            queryClient,
        ],
    )

    return {
        handleUpdate,
    }
}
