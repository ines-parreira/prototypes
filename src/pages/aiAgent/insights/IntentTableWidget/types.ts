export enum IntentTableColumn {
    IntentName = 'name',
    SuccessRateUpliftOpportunity = 'successRateUpliftOpportunity',
    Tickets = 'tickets',
    SuccessRate = 'automationRate',
    AvgCustomerSatisfaction = 'avgCustomerSatisfaction',
    // Resources = 'resources',
}

export type Intent = {
    id: string
    [IntentTableColumn.IntentName]: string
    [IntentTableColumn.SuccessRateUpliftOpportunity]: number
    [IntentTableColumn.Tickets]: number
    [IntentTableColumn.SuccessRate]: number
    [IntentTableColumn.AvgCustomerSatisfaction]: number
    // [IntentTableColumn.Resources]: number
}

export type PaginatedIntents = {
    intents: Intent[]
    allIntents: Intent[]
    currentPage: number
    perPage: number
}

export type IntentMetrics = {
    id?: string | null
    [IntentTableColumn.IntentName]: string
    [IntentTableColumn.SuccessRateUpliftOpportunity]: number | null
    [IntentTableColumn.Tickets]: number | null
    [IntentTableColumn.SuccessRate]: number | null
    [IntentTableColumn.AvgCustomerSatisfaction]: number | null
    // [IntentTableColumn.Resources]: number | null
}
