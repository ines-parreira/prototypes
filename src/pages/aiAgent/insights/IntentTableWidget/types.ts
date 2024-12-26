export enum IntentTableColumn {
    IntentName = 'name',
    AutomationOpportunities = 'automationOpportunity',
    Tickets = 'tickets',
    AutomationRate = 'automationRate',
    AvgCustomerSatisfaction = 'avgCustomerSatisfaction',
    // Resources = 'resources',
}

export type Intent = {
    id: number
    [IntentTableColumn.IntentName]: string
    [IntentTableColumn.AutomationOpportunities]: number
    [IntentTableColumn.Tickets]: number
    [IntentTableColumn.AutomationRate]: number
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
    [IntentTableColumn.AutomationOpportunities]: number | null
    [IntentTableColumn.Tickets]: number | null
    [IntentTableColumn.AutomationRate]: number | null
    [IntentTableColumn.AvgCustomerSatisfaction]: number | null
    // [IntentTableColumn.Resources]: number | null
}
