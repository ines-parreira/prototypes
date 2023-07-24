import {AxiosError} from 'axios'
import {isEmpty} from 'lodash'

import {defaultMergeTicketsView} from 'config/views'
import client from 'models/api/resources'
import {OrderDirection} from 'models/api/types'
import {searchTickets as modelSearchTickets} from 'models/ticket/resources'
import {Ticket, TicketSearchSortableProperties} from 'models/ticket/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'
import {createErrorNotification} from 'state/utils'
import {LDUser, getLDClient} from 'utils/launchDarkly'

export const LIMIT = 5

/**
 * Search tickets using the `defaultMergeTicketsView`, either using the searchQuery or the customerId.
 */
export function searchTickets(
    searchQuery: string,
    sourceTicketId: number,
    customerId: Maybe<number> = null
) {
    return async (
        dispatch: StoreDispatch
    ): Promise<ReturnType<StoreDispatch>> => {
        const view = defaultMergeTicketsView(
            sourceTicketId,
            searchQuery,
            customerId
        )

        const launchDarklyClient = getLDClient()
        try {
            await launchDarklyClient.waitForInitialization()
        } catch (error) {
            if (!isEmpty(LDUser)) {
                throw error
            }
        }

        const promise = modelSearchTickets({
            search: (view.get('search') as string) || '',
            filters: view.get('filters') as string,
            limit: LIMIT,
            orderBy: `${TicketSearchSortableProperties.CreatedDatetime}:${OrderDirection.Desc}`,
        })

        try {
            const resp = await promise
            return resp.data
        } catch (error) {
            dispatch(
                createErrorNotification(error, 'Failed to search tickets.')
            )
            throw error
        }
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
        return client
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
