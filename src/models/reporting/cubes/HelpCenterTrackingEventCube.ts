import {Cube} from '../types'

export enum HelpCenterTrackingEventDimensions {
    Timestamp = 'HelpCenterTrackingEvent.timestamp',
    EventType = 'HelpCenterTrackingEvent.eventType',
    LocaleCode = 'HelpCenterTrackingEvent.localeCode',
    CreatedDate = 'HelpCenterTrackingEvent.createdDate',
    ArticleId = 'HelpCenterTrackingEvent.articleId',
    ArticleTitle = 'HelpCenterTrackingEvent.articleTitle',
    ArticleSlug = 'HelpCenterTrackingEvent.articleSlug',
    ArticleLastUpdated = 'HelpCenterTrackingEvent.articleLastUpdated',
    ArticleParentCategoryIds = 'HelpCenterTrackingEvent.articleParentCategoryIds',
    CategorySlug = 'HelpCenterTrackingEvent.categorySlug',
    CategoryId = 'HelpCenterTrackingEvent.categoryId',
    CategoryTitle = 'HelpCenterTrackingEvent.categoryTitle',
}

export enum HelpCenterTrackingEventMember {
    PeriodStart = 'HelpCenterTrackingEvent.periodStart',
    PeriodEnd = 'HelpCenterTrackingEvent.periodEnd',
}

export enum HelpCenterTrackingEventMeasures {
    ArticleCount = 'HelpCenterTrackingEvent.articleCount',
    ArticleView = 'HelpCenterTrackingEvent.articleViewCount',
    SearchRequestedCount = 'HelpCenterTrackingEvent.searchRequestedCount',
}

export enum HelpCenterTrackingEventSegment {
    ArticleViewOnly = 'HelpCenterTrackingEvent.articleViewOnly',
}

export type HelpCenterTrackingEventCube = Cube<
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventSegment,
    HelpCenterTrackingEventMember
>
