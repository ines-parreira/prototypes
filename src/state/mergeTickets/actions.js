// @flow
import axios from 'axios'
import {type Map} from 'immutable'

import type {Dispatch, thunkActionType} from '../types'
import {notify} from '../notifications/actions'
import {createErrorNotification} from '../utils'
import {defaultMergeTicketsView} from '../../config/views'
import {
    BASE_VIEW_ID,
    NEXT_VIEW_NAV_DIRECTION,
    PREV_VIEW_NAV_DIRECTION,
} from '../../constants/view'

export const LIMIT = 5

/**
 * Search tickets using the `defaultMergeTicketsView`, either using the searchQuery or the customerId.
 *
 * @param searchQuery: the search query to use to search tickets
 * @param sourceTicketId: the id of the source ticket; this search will ignore this ticket
 * @param customerId: the id of a customer: if specified, we get all this customer's tickets, instead of searching
 * @param direction: next or prev; indicates which items should be fetched
 * @param navigation: an object containing information about the list of items currently displayed
 */
export function searchTickets(
    searchQuery: string,
    sourceTicketId: number,
    customerId: ?number = null,
    direction: ?string = null,
    navigation: Map<*, *>
): thunkActionType {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        const view = defaultMergeTicketsView(
            sourceTicketId,
            searchQuery,
            customerId
        )
        let url = `/api/views/${BASE_VIEW_ID}/items/`

        if (!navigation.isEmpty()) {
            if (direction === NEXT_VIEW_NAV_DIRECTION) {
                url = navigation.get('next_items')
            } else if (direction === PREV_VIEW_NAV_DIRECTION) {
                url = navigation.get('prev_items')
            }
        }

        // $FlowFixMe
        return axios.put(url, {view}, {params: {limit: LIMIT}}).then(
            (data) => {
                return Promise.resolve(data.data)
            },
            (error) => {
                dispatch(
                    createErrorNotification(error, 'Failed to search tickets.')
                )
                return Promise.reject(error)
            }
        )
    }
}

/**
 * Merge two tickets together.
 *
 * @param sourceTicketId: the id of the source ticket, which will be deleted after the merge
 * @param targetTicketId: the id of the target ticket, which will inherit messages and properties from the source ticket
 * @param ticketData: data to use to generate the new resulting ticket; every field specified in this object will
 * override default values specified in the backend
 */
export function mergeTickets(
    sourceTicketId: number,
    targetTicketId: number,
    ticketData: Object
): thunkActionType {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        return axios
            .put(
                `/api/tickets/merge?target_id=${targetTicketId}&source_id=${sourceTicketId}`,
                ticketData
            )
            .then(
                (data) => {
                    dispatch(
                        notify({
                            status: 'success',
                            message: 'Tickets merged successfully',
                        })
                    )
                    return Promise.resolve(data.data)
                },
                (error) => {
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
