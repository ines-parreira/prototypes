import {CustomerWithHighlights, TicketWithHighlights} from 'models/search/types'
import {ViewType} from 'models/view/types'

const SEARCH_RESULTS_RESET = ' SEARCH_RESULTS_RESET'
const CUSTOMERS_WITH_HIGHLIGHTS_LOADED = 'CUSTOMERS_WITH_HIGHLIGHTS_LOADED'
const TICKETS_WITH_HIGHLIGHTS_LOADED = 'TICKETS_WITH_HIGHLIGHTS_LOADED'

type SearchResetActionType = {
    type: typeof SEARCH_RESULTS_RESET
}

type CustomersWithHighlightsLoadedActionType = {
    type: typeof CUSTOMERS_WITH_HIGHLIGHTS_LOADED
    payload: CustomerWithHighlights[]
    viewType: ViewType
    cursor?: string
}

type TicketsWithHighlightsLoadedActionType = {
    type: typeof TICKETS_WITH_HIGHLIGHTS_LOADED
    payload: TicketWithHighlights[]
    viewType: ViewType
    cursor?: string
}

export const searchResultsResetAction = (): SearchResetActionType => ({
    type: SEARCH_RESULTS_RESET,
})

export const customersWithHighlightsLoadedAction = (
    customers: CustomerWithHighlights[],
    viewType: ViewType,
    cursor?: string
): CustomersWithHighlightsLoadedActionType => ({
    type: CUSTOMERS_WITH_HIGHLIGHTS_LOADED,
    payload: customers,
    viewType,
    cursor,
})

export const ticketsWithHighlightsLoadedAction = (
    tickets: TicketWithHighlights[],
    viewType: ViewType,
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
        | SearchResetActionType
        | CustomersWithHighlightsLoadedActionType
        | TicketsWithHighlightsLoadedActionType
) => {
    switch (action.type) {
        case SEARCH_RESULTS_RESET:
            return []
        case CUSTOMERS_WITH_HIGHLIGHTS_LOADED:
        case TICKETS_WITH_HIGHLIGHTS_LOADED:
            if (action.cursor || action.viewType === ViewType.All) {
                return [...state, ...action.payload]
            }
            return action.payload
    }
}
