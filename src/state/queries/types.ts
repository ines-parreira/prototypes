export enum QueryKey {
    TicketVoiceCalls = 'ticketVoiceCalls',
}

export type QueriesState = {
    timestamp: {
        [x in QueryKey]?: number
    }
}
