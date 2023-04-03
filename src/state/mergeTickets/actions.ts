import {AxiosError} from 'axios'
import {Map} from 'immutable'

import {FeatureFlagKey} from 'config/featureFlags'
import {searchTickets as modelSearchTickets} from 'models/ticket/resources'
import {getLDClient} from 'utils/launchDarkly'
import {StoreDispatch} from '../types'
import {notify} from '../notifications/actions'
import {createErrorNotification} from '../utils'
import {defaultMergeTicketsView} from '../../config/views'
import {BASE_VIEW_ID} from '../../constants/view'
import {ApiListResponsePagination, OrderDirection} from '../../models/api/types'
import {Ticket, TicketSearchSortableProperties} from '../../models/ticket/types'
import {MoveIndexDirection} from '../../pages/common/utils/keyboard'
import {NotificationStatus} from '../notifications/types'
import client from '../../models/api/resources'

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
    return async (
        dispatch: StoreDispatch
    ): Promise<ReturnType<StoreDispatch>> => {
        const view = defaultMergeTicketsView(
            sourceTicketId,
            searchQuery,
            customerId
        )
        let url = `/api/views/${BASE_VIEW_ID}/items/`

        if (!navigation.isEmpty()) {
            if (direction === MoveIndexDirection.Next) {
                url = navigation.get('next_items')
            } else if (direction === MoveIndexDirection.Prev) {
                url = navigation.get('prev_items')
            }
        }

        let promise

        const launchDarklyClient = getLDClient()
        await launchDarklyClient.waitForInitialization()

        if (
            launchDarklyClient.variation(
                FeatureFlagKey.ElasticsearchTicketSearch
            )
        ) {
            promise = modelSearchTickets({
                search: (view.get('search') as string) || '',
                filters: view.get('filters') as string,
                limit: LIMIT,
                orderBy: `${TicketSearchSortableProperties.CreatedDatetime}:${OrderDirection.Desc}`,
            })
        } else {
            promise = client.put<ApiListResponsePagination<Ticket[]>>(
                url,
                {view},
                {params: {limit: LIMIT}}
            )
        }

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
