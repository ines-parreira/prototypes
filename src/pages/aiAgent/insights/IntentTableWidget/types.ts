export enum IntentTableColumn {
    IntentName = 'name',
    AutomationOpportunities = 'automationOpportunity',
    Tickets = 'tickets',
    SuccessRate = 'automationRate',
    AvgCustomerSatisfaction = 'avgCustomerSatisfaction',
    Resources = 'resources',
}

export type Intent = {
    id: number
    [IntentTableColumn.IntentName]: string
    [IntentTableColumn.AutomationOpportunities]: number
    [IntentTableColumn.Tickets]: number
    [IntentTableColumn.SuccessRate]: number
    [IntentTableColumn.AvgCustomerSatisfaction]: number
    [IntentTableColumn.Resources]: number
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
    [IntentTableColumn.AutomationOpportunities]: number | null
    [IntentTableColumn.Tickets]: number | null
    [IntentTableColumn.SuccessRate]: number | null
    [IntentTableColumn.AvgCustomerSatisfaction]: number | null
    [IntentTableColumn.Resources]: number | null
}
