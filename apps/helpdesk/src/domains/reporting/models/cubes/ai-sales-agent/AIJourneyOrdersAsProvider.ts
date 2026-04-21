import type { Cube } from 'domains/reporting/models/types'

export enum AIJourneyOrdersAsProviderMeasure {
    Gmv = 'AIJourneyOrdersAsProvider.gmv',
    GmvUsd = 'AIJourneyOrdersAsProvider.gmvUsd',
    Count = 'AIJourneyOrdersAsProvider.count',
}

export enum AIJourneyOrdersAsProviderDimension {
    Provider = 'AIJourneyOrdersAsProvider.provider',
    IntegrationId = 'AIJourneyOrdersAsProvider.integrationId',
    Source = 'AIJourneyOrdersAsProvider.source',
    PeriodStart = 'AIJourneyOrdersAsProvider.periodStart',
    PeriodEnd = 'AIJourneyOrdersAsProvider.periodEnd',
    JourneyId = 'AIJourneyOrdersAsProvider.journeyId',
    Currency = 'AIJourneyOrdersAsProvider.currency',
    InfluencedBy = 'AIJourneyOrdersAsProvider.influencedBy',
    TicketId = 'AIJourneyOrdersAsProvider.ticketId',
    OrderId = 'AIJourneyOrdersAsProvider.orderId',
    TotalAmount = 'AIJourneyOrdersAsProvider.totalAmount',
    CustomerId = 'AIJourneyOrdersAsProvider.customerId',
}

export enum AIJourneyOrdersAsProviderFilterMember {
    Provider = 'AIJourneyOrdersAsProvider.provider',
    PeriodStart = 'AIJourneyOrdersAsProvider.periodStart',
    PeriodEnd = 'AIJourneyOrdersAsProvider.periodEnd',
    IntegrationId = 'AIJourneyOrdersAsProvider.integrationId',
    Source = 'AIJourneyOrdersAsProvider.source',
    JourneyId = 'AIJourneyOrdersAsProvider.journeyId',
    Channel = 'AIJourneyOrdersAsProvider.channel',
    Outcome = 'AIJourneyOrdersAsProvider.outcome',
    OrderId = 'AIJourneyOrdersAsProvider.orderId',
}

export type AIJourneyOrdersAsProviderTimeDimension =
    | ValueOf<AIJourneyOrdersAsProviderFilterMember.PeriodStart>
    | ValueOf<AIJourneyOrdersAsProviderFilterMember.PeriodEnd>

export type AIJourneyOrdersAsProviderCube = Cube<
    AIJourneyOrdersAsProviderMeasure,
    AIJourneyOrdersAsProviderDimension,
    never,
    AIJourneyOrdersAsProviderFilterMember,
    AIJourneyOrdersAsProviderTimeDimension
>
