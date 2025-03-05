import { Cube } from 'models/reporting/types'

export enum ConvertTrackingEventsMeasure {
    Clicks = 'CampaignEvents.clicks',
}

export enum ConvertTrackingEventsDimension {
    Source = `CampaignEvents.source`,
    CreatedDatetime = `CampaignEvents.createdDatetime`,
}

export enum ConvertTrackingEventsFilterMember {
    AccountId = 'CampaignEvents.accountId',
    CreatedDatetime = `CampaignEvents.createdDatetime`,
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
