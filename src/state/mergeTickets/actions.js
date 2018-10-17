// @flow
import axios from 'axios'

import type {dispatchType, thunkActionType} from '../types'
import {notify} from '../notifications/actions'
import {createErrorNotification} from '../utils'
import {defaultMergeTicketsView} from '../../config/views'


export const PER_PAGE = 5


/**
 * Search tickets using the `defaultMergeTicketsView`, either using the searchQuery or the customerId.
 *
 * @param searchQuery: the search query to use to search tickets
 * @param sourceTicketId: the id of the source ticket; this search will ignore this ticket
 * @param page: the page of the results we want to fetch
 * @param customerId: the id of a customer: if specified, we get all this customer's tickets, instead of searching
 * using the `searchQuery`
 */
export function searchTickets(searchQuery: string,
                       sourceTicketId: number,
                       page?: number = 1,
                       customerId: ?number = null): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        const view = defaultMergeTicketsView(sourceTicketId, searchQuery, customerId)

        return axios.put(`/api/tickets/search/?page=${page.toString(10)}&per_page=${PER_PAGE}`, {view})
            .then((data) => {
                return Promise.resolve(data.data)
            }, (error) => {
                dispatch(createErrorNotification(error, 'Failed to search tickets.'))
                return Promise.reject(error)
            })
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
export function mergeTickets(sourceTicketId: number, targetTicketId: number, ticketData: Object): thunkActionType {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.put(`/api/tickets/merge?target_id=${targetTicketId}&source_id=${sourceTicketId}`, ticketData)
            .then((data) => {
                dispatch(notify({
                    status: 'success',
                    message: 'Tickets merged successfully',
                }))
                return Promise.resolve(data.data)
            }, (error) => {
                dispatch(createErrorNotification(error, 'Could not merge tickets.'))
                return Promise.reject(error)
            })
    }
}
