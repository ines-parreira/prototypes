import type { Cube } from 'domains/reporting/models/types'

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
    SearchQuery = 'HelpCenterTrackingEvent.searchQuery',
    ArticleTitle = 'HelpCenterTrackingEvent.articleTitle',
    PeriodStart = 'HelpCenterTrackingEvent.periodStart',
    PeriodEnd = 'HelpCenterTrackingEvent.periodEnd',
    HelpCenterId = 'HelpCenterTrackingEvent.helpCenterId',
    LocaleCode = 'HelpCenterTrackingEvent.localeCode',
}

export enum HelpCenterTrackingEventMeasures {
    ArticleCount = 'HelpCenterTrackingEvent.articleCount',
    SearchRequestedCount = 'HelpCenterTrackingEvent.searchRequestedCount',
    ArticleView = 'HelpCenterTrackingEvent.articleViewCount',
    SearchRequestedQueryCount = 'HelpCenterTrackingEvent.searchRequestedQueryCount',
    SearchArticlesClickedCount = 'HelpCenterTrackingEvent.searchArticlesClickedCount',
    SearchArticlesClickedCountUnique = 'HelpCenterTrackingEvent.searchArticlesClickedCountUnique',
    UniqueSearchQueryCount = 'HelpCenterTrackingEvent.uniqueSearchQueryCount',
}

export enum HelpCenterTrackingEventSegment {
    ArticleViewOnly = 'HelpCenterTrackingEvent.articleViewOnly',
    SearchRequestedOnly = 'HelpCenterTrackingEvent.searchRequestedOnly',
    SearchResultClickedOnly = 'HelpCenterTrackingEvent.searchResultClickedOnly',
    NoSearchResultOnly = 'HelpCenterTrackingEvent.noSearchResultOnly',
    SearchRequestWithClicks = 'HelpCenterTrackingEvent.searchRequestWithClicks',
}

export type HelpCenterTrackingEventCube = Cube<
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventSegment,
    HelpCenterTrackingEventMember
>
