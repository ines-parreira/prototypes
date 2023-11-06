import {Cube} from '../types'

export enum HelpCenterTrackingEventDimensions {
    Timestamp = 'HelpCenterTrackingEvent.timestamp',
    EventType = 'HelpCenterTrackingEvent.eventType',
    LocaleCode = 'HelpCenterTrackingEvent.localeCode',
    ArticleId = 'HelpCenterTrackingEvent.articleId',
    ArticleTitle = 'HelpCenterTrackingEvent.articleTitle',
    ArticleSlug = 'HelpCenterTrackingEvent.articleSlug',
    ArticleLastUpdated = 'HelpCenterTrackingEvent.articleLastUpdated',
    CategorySlug = 'HelpCenterTrackingEvent.categorySlug',
    SearchResultRange = 'HelpCenterTrackingEvent.searchResultRange',
    SearchQuery = 'HelpCenterTrackingEvent.searchQuery',
    SearchResultCount = 'HelpCenterTrackingEvent.searchResultCount',
}

export enum HelpCenterTrackingEventMember {
    PeriodStart = 'HelpCenterTrackingEvent.periodStart',
    PeriodEnd = 'HelpCenterTrackingEvent.periodEnd',
}

export enum HelpCenterTrackingEventMeasures {
    ArticleCount = 'HelpCenterTrackingEvent.articleCount',
    SearchRequestedCount = 'HelpCenterTrackingEvent.searchRequestedCount',
    ArticleView = 'HelpCenterTrackingEvent.articleViewCount',
    SearchRequestedQueryCount = 'HelpCenterTrackingEvent.searchRequestedQueryCount',
    SearchArticlesClickedCount = 'HelpCenterTrackingEvent.searchArticlesClickedCount',
    UniqueSearchQueryCount = 'HelpCenterTrackingEvent.uniqueSearchQueryCount',
}

export enum HelpCenterTrackingEventSegment {
    ArticleViewOnly = 'HelpCenterTrackingEvent.articleViewOnly',
    SearchRequestedOnly = 'HelpCenterTrackingEvent.searchRequestedOnly',
    NoSearchResultOnly = 'HelpCenterTrackingEvent.noSearchResultOnly',
}

export type HelpCenterTrackingEventCube = Cube<
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventSegment,
    HelpCenterTrackingEventMember
>
