import {Cube} from '../types'

export enum HelpCenterTrackingEventDimensions {
    Timestamp = 'HelpCenterTrackingEvent.timestamp',
    EventType = 'HelpCenterTrackingEvent.eventType',
    LocaleCode = 'HelpCenterTrackingEvent.localeCode',
    CreatedDate = 'HelpCenterTrackingEvent.createdDate',
    ArticleTitle = 'HelpCenterTrackingEvent.articleTitle',
}

export enum HelpCenterTrackingEventMember {
    PeriodStart = 'HelpCenterTrackingEvent.periodStart',
    PeriodEnd = 'HelpCenterTrackingEvent.periodEnd',
}

export enum HelpCenterTrackingEventMeasures {
    ArticleView = 'HelpCenterTrackingEvent.articleView',
    Search = 'HelpCenterTrackingEvent.search',
}

export type HelpCenterTrackingEventCube = Cube<
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventDimensions,
    never,
    HelpCenterTrackingEventMember
>
