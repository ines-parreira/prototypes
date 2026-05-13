import { useCallback, useReducer } from 'react'

import { useHistory } from 'react-router-dom'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useCreateNewJourney } from 'AIJourney/queries'
import { useDeleteJourney } from 'AIJourney/queries/useDeleteJourney/useDeleteJourney'
import { getJourneyData } from 'AIJourney/queries/useJourneyData/useJourneyData'

export type CampaignsModalState =
    | { kind: 'closed' }
    | { kind: 'remove'; campaignId: string }
    | { kind: 'send'; campaignId: string; hasIncludedAudiences: boolean }
    | { kind: 'cancel'; campaignId: string }

type ModalAction =
    | { type: 'open'; modal: Exclude<CampaignsModalState, { kind: 'closed' }> }
    | { type: 'close' }

const CLOSED: CampaignsModalState = { kind: 'closed' }

function modalReducer(
    _state: CampaignsModalState,
    action: ModalAction,
): CampaignsModalState {
    switch (action.type) {
        case 'open':
            return action.modal
        case 'close':
            return CLOSED
    }
}

type UseCampaignActionsParams = {
    integrationId: number | undefined
    shopName: string
}

export function useCampaignActions({
    integrationId,
    shopName,
}: UseCampaignActionsParams) {
    const history = useHistory()
    const [modalState, dispatch] = useReducer(modalReducer, CLOSED)

    const { mutate: deleteCampaign } = useDeleteJourney()
    const { handleUpdate } = useJourneyUpdateHandler({
        integrationId,
        entityLabel: 'campaign',
    })
    const createNewJourney = useCreateNewJourney()

    const closeModal = useCallback(() => {
        dispatch({ type: 'close' })
    }, [])

    const openRemoveModal = useCallback((campaignId: string) => {
        dispatch({ type: 'open', modal: { kind: 'remove', campaignId } })
    }, [])

    const openSendModal = useCallback(
        (campaignId: string, hasIncludedAudiences: boolean) => {
            dispatch({
                type: 'open',
                modal: { kind: 'send', campaignId, hasIncludedAudiences },
            })
        },
        [],
    )

    const openCancelModal = useCallback((campaignId: string) => {
        dispatch({ type: 'open', modal: { kind: 'cancel', campaignId } })
    }, [])

    const confirmRemove = useCallback(() => {
        if (modalState.kind === 'remove') {
            deleteCampaign({ id: modalState.campaignId })
        }
        closeModal()
    }, [modalState, deleteCampaign, closeModal])

    const confirmSend = useCallback(() => {
        if (modalState.kind === 'send') {
            handleUpdate({
                id: modalState.campaignId,
                campaignState: JourneyCampaignStateEnum.Scheduled,
                scheduledDatetime: null,
            })
        }
        closeModal()
    }, [modalState, handleUpdate, closeModal])

    const confirmCancel = useCallback(() => {
        if (modalState.kind === 'cancel') {
            handleUpdate({
                id: modalState.campaignId,
                campaignState: JourneyCampaignStateEnum.Canceled,
            })
        }
        closeModal()
    }, [modalState, handleUpdate, closeModal])

    const changeStatus = useCallback(
        (id: string, status: UpdatableJourneyCampaignState) => {
            if (id) {
                handleUpdate({ id, campaignState: status })
            }
        },
        [handleUpdate],
    )

    const duplicateJourney = useCallback(
        async (journey: JourneyApiDTO) => {
            const journeyData = await getJourneyData(journey.id)

            const createdJourney = await createNewJourney.mutateAsync({
                params: {
                    store_integration_id: journeyData.store_integration_id,
                    store_name: journeyData.store_name,
                    type: journeyData.type,
                    campaign: {
                        title:
                            (journeyData.campaign?.title || 'Untitled') +
                            ' (Copy)',
                    },
                    included_audience_list_ids:
                        journeyData.included_audience_list_ids,
                    excluded_audience_list_ids:
                        journeyData.excluded_audience_list_ids,
                    message_instructions: journeyData.message_instructions,
                    ...(journeyData.execution_mode_override !== undefined && {
                        execution_mode_override:
                            journeyData.execution_mode_override,
                    }),
                },
                journeyConfigs: {
                    max_follow_up_messages:
                        journeyData.configuration?.max_follow_up_messages,
                    offer_discount: journeyData.configuration?.offer_discount,
                    max_discount_percent:
                        journeyData.configuration?.max_discount_percent,
                    sms_sender_integration_id:
                        journeyData.configuration?.sms_sender_integration_id,
                    sms_sender_number:
                        journeyData.configuration?.sms_sender_number,
                    discount_code_message_threshold:
                        journeyData.configuration
                            ?.discount_code_message_threshold,
                },
            })

            history.push(
                `/app/ai-journey/${shopName}/${createdJourney.type}/setup/${createdJourney.id}`,
            )
        },
        [history, createNewJourney, shopName],
    )

    return {
        modalState,
        closeModal,
        openRemoveModal,
        openSendModal,
        openCancelModal,
        confirmRemove,
        confirmSend,
        confirmCancel,
        changeStatus,
        duplicateJourney,
    }
}
