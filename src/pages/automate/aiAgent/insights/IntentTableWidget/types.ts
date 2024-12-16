export enum IntentTableColumn {
    IntentName = 'intent_name',
    AutomationOpportunities = 'automation_opportunities',
    Tickets = 'tickets',
    AutomationRate = 'automation_rate',
    AvgCustomerSatisfaction = 'avg_customer_satisfaction',
    Resources = 'resources',
}

export type Intent = {
    id: number
    intent_name: string
    automation_opportunities: number
    tickets: number
    automation_rate: number
    avg_customer_satisfaction: number
    resources: number
}

export type PaginatedIntents = {
    intents: Intent[]
    allIntents: Intent[]
    currentPage: number
    perPage: number
}
