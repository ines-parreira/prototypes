import { TicketSummary } from '@gorgias/api-types'

export type ReduxCustomerHistory = {
    triedLoading: boolean
    hasHistory: boolean
    // It’s not exactly that type yet but it’s a start
    tickets: TicketSummary[]
}
