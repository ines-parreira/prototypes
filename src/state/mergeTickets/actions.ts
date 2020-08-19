import axios, {AxiosError} from 'axios'
import {Map} from 'immutable'

import {StoreDispatch} from '../types'
import {notify} from '../notifications/actions.js'
import {createErrorNotification} from '../utils.js'
import {defaultMergeTicketsView} from '../../config/views.js'
import {
    BASE_VIEW_ID,
    NEXT_VIEW_NAV_DIRECTION,
    PREV_VIEW_NAV_DIRECTION,
} from '../../constants/view.js'
import {ApiListResponsePagination} from '../../models/api/types'
import {Ticket} from '../../models/ticket/types'
import {NotificationStatus} from '../notifications/types'

export const LIMIT = 5

/**
 * Search tickets using the `defaultMergeTicketsView`, either using the searchQuery or the customerId.
 */
export function searchTickets(
    searchQuery: string,
    sourceTicketId: number,
    customerId: Maybe<number> = null,
    direction: Maybe<string> = null,
    navigation: Map<any, any>
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        //$TsFixMe remove casting once defaultMergeTicketsView is migrated
        const view = defaultMergeTicketsView(
            sourceTicketId,
            searchQuery,
            customerId
        ) as Map<any, any>
        let url = `/api/views/${BASE_VIEW_ID}/items/`

        if (!navigation.isEmpty()) {
            if (direction === NEXT_VIEW_NAV_DIRECTION) {
                url = navigation.get('next_items')
            } else if (direction === PREV_VIEW_NAV_DIRECTION) {
                url = navigation.get('prev_items')
            }
        }

        return axios
            .put<ApiListResponsePagination<Ticket[]>>(
                url,
                {view},
                {params: {limit: LIMIT}}
            )
            .then(
                (data) => {
                    return Promise.resolve(data.data)
                },
                (error) => {
                    dispatch(
                        createErrorNotification(
                            error,
                            'Failed to search tickets.'
                        )
                    )
                    return Promise.reject(error)
                }
            )
    }
}

/**
 * Merge two tickets together.
 */
export function mergeTickets(
    sourceTicketId: number,
    targetTicketId: number,
    ticketData: Ticket
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return axios
            .put<Ticket>(
                `/api/tickets/merge?target_id=${targetTicketId}&source_id=${sourceTicketId}`,
                ticketData
            )
            .then(
                (data) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Tickets merged successfully',
                        })
                    )
                    return Promise.resolve(data.data)
                },
                (error: AxiosError) => {
                    dispatch(
                        createErrorNotification(
                            error,
                            'Could not merge tickets.'
                        )
                    )
                    return Promise.reject(error)
                }
            )
    }
}
