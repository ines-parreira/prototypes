import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type {
    JourneyConfigurationApiDTO,
    JourneyStatusEnum,
    PatchJourneyBody,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'

import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import { useUpdateJourney } from 'AIJourney/queries'
import { aiJourneyKeys } from 'AIJourney/queries/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UseJourneyUpdateHandlerParams = {
    integrationId?: number
    journeyId?: string
}

type HandleUpdateParams = {
    campaignState?: UpdatableJourneyCampaignState
    campaignTitle?: string
    discountCodeThresholdValue?: number
    discountValue?: string
    excludedAudienceListIds?: string[]
    followUpValue?: number
    id?: string
    includeImage?: boolean
    includedAudienceListIds?: string[]
    isDiscountEnabled?: boolean
    journeyMessageInstructions?: string | null
    journeyState?: JourneyStatusEnum
    phoneNumberValue?: NewPhoneNumber
    inactiveDays?: number | null
    cooldownDays?: number | null
}

export const useJourneyUpdateHandler = ({
    integrationId,
    journeyId,
}: UseJourneyUpdateHandlerParams) => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()
    const updateJourney = useUpdateJourney()

    const handleUpdate = useCallback(
        async ({
            campaignState,
            campaignTitle,
            discountCodeThresholdValue,
            discountValue,
            excludedAudienceListIds,
            followUpValue,
            id,
            includeImage,
            includedAudienceListIds,
            isDiscountEnabled,
            journeyMessageInstructions,
            journeyState,
            phoneNumberValue,
            inactiveDays,
            cooldownDays,
        }: HandleUpdateParams) => {
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

                const journeyConfigs:
                    | JourneyConfigurationApiDTO
                    | WinbackJourneyConfigurationApiDTO = {
                    max_follow_up_messages: followUpValue,
                    offer_discount: isDiscountEnabled,
                    max_discount_percent: discountValue
                        ? Number(discountValue)
                        : undefined,
                    sms_sender_integration_id: smsIntegrationId,
                    sms_sender_number: phoneNumberValue?.phone_number,
                    discount_code_message_threshold: discountCodeThresholdValue,
                    include_image: includeImage,
                    inactive_days: inactiveDays,
                    cooldown_days: cooldownDays,
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
