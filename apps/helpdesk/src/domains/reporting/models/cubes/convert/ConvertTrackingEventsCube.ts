import type { Cube } from 'domains/reporting/models/types'

export enum ConvertTrackingEventsMeasure {
    Clicks = 'CampaignEvents.clicks',
    UniqClicks = 'CampaignEvents.uniqClicks',
}

export enum ConvertTrackingEventsDimension {
    PeriodStart = 'CampaignEvents.periodStart',
    PeriodEnd = 'CampaignEvents.periodEnd',
    Source = `CampaignEvents.source`,
    ProductId = `CampaignEvents.productId`,
    CreatedDatetime = `CampaignEvents.createdDatetime`,
    JourneyId = `CampaignEvents.journeyId`,
    ShopName = `CampaignEvents.shopName`,
}

export enum ConvertTrackingEventsFilterMember {
    AccountId = 'CampaignEvents.accountId',
    CreatedDatetime = `CampaignEvents.createdDatetime`,
    ShopName = 'CampaignEvents.shopName',
}

export type ConvertTrackingEventsTimeDimension =
    ValueOf<ConvertTrackingEventsFilterMember.CreatedDatetime>

export type ConvertTrackingEventsCube = Cube<
    ConvertTrackingEventsMeasure,
    ConvertTrackingEventsDimension,
    never,
    ConvertTrackingEventsFilterMember,
    ConvertTrackingEventsTimeDimension
>
