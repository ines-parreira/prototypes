import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import ArticleViewsGraph from 'domains/reporting/pages/help-center/components/ArticleViewsGraph/ArticleViewsGraph'
import { ArticleViewsTrendCard } from 'domains/reporting/pages/help-center/components/ArticleViewsTrendCard/ArticleViewsTrendCard'
import NoSearchTable, {
    NO_SEARCH_TABLE_TITLE,
} from 'domains/reporting/pages/help-center/components/NoSearchTable/NoSearchTable'
import { PerformanceByArticleChart } from 'domains/reporting/pages/help-center/components/PerformanceByArticle/PerformanceByArticleChart'
import { SearchesTrendCard } from 'domains/reporting/pages/help-center/components/SearchesTrendCard/SearchesTrendCard'
import SearchResultDonut from 'domains/reporting/pages/help-center/components/SearchResultDonut/SearchResultDonut'
import { SearchTermsTableChart } from 'domains/reporting/pages/help-center/components/SearchTermsTable/SearchTermsTableChart'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
    SEARCH_RESULTS_DONUT_TITLE,
    SEARCH_RESULTS_DONUT_TOOLTIP,
} from 'domains/reporting/pages/help-center/HelpCenterMetricsConfig'
import { STATS_ROUTES } from 'routes/constants'

const PAGE_TITLE_HELP_CENTER = 'Help Center'

export enum HelpCenterChart {
    ArticleViewsTrendCard = 'article_views_trend_card',
    SearchesTrendCard = 'searches_trend_card',
    ArticleViewsGraph = 'article_views_graph',
    PerformanceByArticleTable = 'performance_by_article_table',
    SearchResultsDonut = 'search_results_donut',
    SearchTermsTable = 'search_terms_table',
    NoSearchTable = 'no_search_table',
}

const HELP_CENTER_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
    FilterKey.HelpCenters,
    FilterKey.LocaleCodes,
]
const HELP_CENTER_OPTIONAL_FILTERS: OptionalFilter[] = []

export const HelpCenterReportConfig: ReportConfig<HelpCenterChart> = {
    id: ReportsIDs.HelpCenterReportConfig,
    reportName: PAGE_TITLE_HELP_CENTER,
    reportPath: STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER,
    reportFilters: {
        persistent: HELP_CENTER_PERSISTENT_FILTERS,
        optional: HELP_CENTER_OPTIONAL_FILTERS,
    },
    charts: {
        [HelpCenterChart.ArticleViewsTrendCard]: {
            chartComponent: ArticleViewsTrendCard,
            label: HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].title,
            description:
                HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].hint
                    .title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
        [HelpCenterChart.SearchesTrendCard]: {
            chartComponent: SearchesTrendCard,
            label: HelpCenterMetricConfig[HelpCenterMetric.SearchRequested]
                .title,
            description:
                HelpCenterMetricConfig[HelpCenterMetric.SearchRequested].hint
                    .title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
        [HelpCenterChart.ArticleViewsGraph]: {
            chartComponent: ArticleViewsGraph,
            label: HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].title,
            description:
                HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].hint
                    .title,
            csvProducer: null,
            chartType: ChartType.Graph,
        },
        [HelpCenterChart.PerformanceByArticleTable]: {
            chartComponent: PerformanceByArticleChart,
            label: 'Performance by articles',
            description: '',
            csvProducer: null,
            chartType: ChartType.Graph,
        },
        [HelpCenterChart.SearchResultsDonut]: {
            chartComponent: SearchResultDonut,
            label: SEARCH_RESULTS_DONUT_TITLE,
            description: SEARCH_RESULTS_DONUT_TOOLTIP.title,
            csvProducer: null,
            chartType: ChartType.Graph,
        },
        [HelpCenterChart.SearchTermsTable]: {
            chartComponent: SearchTermsTableChart,
            label: 'Search terms with results',
            description: '',
            csvProducer: null,
            chartType: ChartType.Table,
        },
        [HelpCenterChart.NoSearchTable]: {
            chartComponent: NoSearchTable,
            label: NO_SEARCH_TABLE_TITLE,
            description: '',
            csvProducer: null,
            chartType: ChartType.Table,
        },
    },
}
