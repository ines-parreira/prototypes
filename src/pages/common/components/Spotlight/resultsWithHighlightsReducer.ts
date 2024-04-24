import {CustomerWithHighlights, TicketWithHighlights} from 'models/search/types'
import {ViewType} from 'models/view/types'

const CUSTOMERS_WITH_HIGHLIGHTS_LOADED = 'CUSTOMERS_WITH_HIGHLIGHTS_LOADED'
const TICKETS_WITH_HIGHLIGHTS_LOADED = 'TICKETS_WITH_HIGHLIGHTS_LOADED'

type CustomersWithHighlightsLoadedActionType = {
    type: typeof CUSTOMERS_WITH_HIGHLIGHTS_LOADED
    payload: CustomerWithHighlights[]
    viewType: ViewType.All | ViewType.CustomerList
    cursor?: string
}

type TicketsWithHighlightsLoadedActionType = {
    type: typeof TICKETS_WITH_HIGHLIGHTS_LOADED
    payload: TicketWithHighlights[]
    viewType: ViewType.All | ViewType.TicketList
    cursor?: string
}

export const customersWithHighlightsLoadedAction = (
    customers: CustomerWithHighlights[],
    viewType: ViewType.All | ViewType.CustomerList,
    cursor?: string
): CustomersWithHighlightsLoadedActionType => ({
    type: CUSTOMERS_WITH_HIGHLIGHTS_LOADED,
    payload: customers,
    viewType,
    cursor,
})

export const ticketsWithHighlightsLoadedAction = (
    tickets: TicketWithHighlights[],
    viewType: ViewType.All | ViewType.TicketList,
    cursor?: string
): TicketsWithHighlightsLoadedActionType => ({
    type: TICKETS_WITH_HIGHLIGHTS_LOADED,
    payload: tickets,
    viewType,
    cursor,
})

export const resultsWithHighlightsReducer = (
    state: (CustomerWithHighlights | TicketWithHighlights)[],
    action:
        | CustomersWithHighlightsLoadedActionType
        | TicketsWithHighlightsLoadedActionType
) => {
    switch (action.type) {
        case CUSTOMERS_WITH_HIGHLIGHTS_LOADED:
        case TICKETS_WITH_HIGHLIGHTS_LOADED:
            if (action.cursor || action.viewType === ViewType.All) {
                return [...state, ...action.payload]
            }
            return action.payload
    }
}
