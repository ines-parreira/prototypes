export type SearchTrackingRequest = {
    query: string
    requestTime: number
}

export type SearchTrackingResponse = {
    responseTime: number
    numberOfResults: number
    searchEngine?: string
}

export type SearchTrackingSelection = {
    id: number | string
    index: number
}

export type SearchTracking = {
    onRequest?: (request: SearchTrackingRequest) => void
    onResponse?: (response: SearchTrackingResponse) => void
    onSelection?: (selection: SearchTrackingSelection) => void
}
