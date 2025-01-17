import {FilterKey, StaticFilter} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {CHARTS_MODAL_ICONS} from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon'
import {ReportConfig} from 'pages/stats/custom-reports/types'
import ArticleViewsGraph from 'pages/stats/help-center/components/ArticleViewsGraph/ArticleViewsGraph'
import {ArticleViewsTrendCard} from 'pages/stats/help-center/components/ArticleViewsTrendCard/ArticleViewsTrendCard'
import NoSearchTable, {
    NO_SEARCH_TABLE_TITLE,
} from 'pages/stats/help-center/components/NoSearchTable/NoSearchTable'
import {PerformanceByArticleChart} from 'pages/stats/help-center/components/PerformanceByArticle/PerformanceByArticleChart'
import {SearchesTrendCard} from 'pages/stats/help-center/components/SearchesTrendCard/SearchesTrendCard'
import SearchResultDonut from 'pages/stats/help-center/components/SearchResultDonut/SearchResultDonut'
import {SearchTermsTableChart} from 'pages/stats/help-center/components/SearchTermsTable/SearchTermsTableChart'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
    SEARCH_RESULTS_DONUT_TITLE,
    SEARCH_RESULTS_DONUT_TOOLTIP,
} from 'pages/stats/help-center/HelpCenterMetricsConfig'

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
    reportName: PAGE_TITLE_HELP_CENTER,
    reportPath: 'help-center',
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
            icon: CHARTS_MODAL_ICONS.card,
        },
        [HelpCenterChart.SearchesTrendCard]: {
            chartComponent: SearchesTrendCard,
            label: HelpCenterMetricConfig[HelpCenterMetric.SearchRequested]
                .title,
            description:
                HelpCenterMetricConfig[HelpCenterMetric.SearchRequested].hint
                    .title,
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.card,
        },
        [HelpCenterChart.ArticleViewsGraph]: {
            chartComponent: ArticleViewsGraph,
            label: HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].title,
            description:
                HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].hint
                    .title,
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.graph,
        },
        [HelpCenterChart.PerformanceByArticleTable]: {
            chartComponent: PerformanceByArticleChart,
            label: 'Performance by articles',
            description: '',
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.graph,
        },
        [HelpCenterChart.SearchResultsDonut]: {
            chartComponent: SearchResultDonut,
            label: SEARCH_RESULTS_DONUT_TITLE,
            description: SEARCH_RESULTS_DONUT_TOOLTIP.title,
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.graph,
        },
        [HelpCenterChart.SearchTermsTable]: {
            chartComponent: SearchTermsTableChart,
            label: 'Search terms with results',
            description: '',
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.table,
        },
        [HelpCenterChart.NoSearchTable]: {
            chartComponent: NoSearchTable,
            label: NO_SEARCH_TABLE_TITLE,
            description: '',
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.table,
        },
    },
}
