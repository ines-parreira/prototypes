import type { Cube } from 'domains/reporting/models/types'

export enum AIJourneyOrdersAsProviderMeasure {
    Gmv = 'AIJourneyOrdersAsProvider.gmv',
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
