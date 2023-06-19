import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {fromJS, Map} from 'immutable'

import {assetsUrl} from 'utils'
import {
    SELF_SERVICE_OVERVIEW,
    SELF_SERVICE_TOP_REPORTED_ISSUES,
    stats as statsConfig,
    SELF_SERVICE_VOLUME_PER_FLOW,
    SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE,
    SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE,
    SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS,
    AUTOMATION_ADD_ON_OVERVIEW,
    SELF_SERVICE_WORKFLOWS_PERFORMANCE,
} from 'config/stats'
import {fetchSelfServiceConfigurations} from 'models/selfServiceConfiguration/resources'
import {
    AnyStatAxisValue,
    DataStatLine,
    OneDimensionalUnionChart,
    StatsFilters,
    TwoDimensionalChart,
} from 'models/stat/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {selfServiceConfigurationsFetched} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getStatsFilters} from 'state/stats/selectors'
import {mergeStatsFilters} from 'state/stats/actions'
import Loader from 'pages/common/components/Loader/Loader'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {getIntegrations} from 'state/integrations/selectors'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import PageHeader from 'pages/common/components/PageHeader'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import useWorkflowApi from 'pages/automation/workflows/hooks/useWorkflowApi'
import {WorkflowConfiguration} from 'pages/automation/workflows/models/workflowConfiguration.types'

import KeyMetricStat from '../common/components/charts/KeyMetricStat/KeyMetricStat'
import TableStat from '../common/components/charts/TableStat/TableStat'
import NormalizedLineStat from '../common/components/charts/NormalizedLineStat'
import KeyMetricStatWrapper from '../KeyMetricStatWrapper'
import PeriodStatsFilter from '../PeriodStatsFilter'
import StatsPage from '../StatsPage'
import StatWrapper from '../StatWrapper'
import useStatResource from '../useStatResource'

import SelfServiceIntegrationsFilter from './SelfServiceIntegrationsFilter'
import {SelfServiceFeaturePreview} from './SelfServiceFeaturePreview'
import SelfServiceStatsPagePaywallCustomCta from './SelfServiceStatsPagePaywallCustomCta'
import {
    AUTOMATION_SELF_SERVICE_STAT_NAME,
    HELP_URL,
    PAGE_TITLE,
    PAGE_DESCRIPTION,
} from './constants'

import css from './SelfServiceStatsPage.less'

export const SelfServiceStatsPage = (): JSX.Element => {
    const [noActivityAlertDismissed, setNoActivityAlertDismissed] =
        useState(false)
    const [workflowConfigurations, setWorkflowConfigurations] = useState<
        WorkflowConfiguration[]
    >([])
    const dispatch = useAppDispatch()
    const integrations = useAppSelector(getIntegrations)
    const statsFilters = useAppSelector(getStatsFilters)
    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {period, integrations} = statsFilters
        return {
            period,
            integrations,
        }
    }, [statsFilters])
    const {fetchWorkflowConfigurations} = useWorkflowApi()
    const [
        {loading: isSelfServiceFetchPending},
        retrieveSelfServiceConfigurations,
    ] = useAsyncFn(async () => {
        try {
            const res = await fetchSelfServiceConfigurations()
            void dispatch(selfServiceConfigurationsFetched(res.data))
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Could not fetch Self-service configurations, please try again later.',
                })
            )
        }
    }, [])
    const [{loading: isWorkflowsFetchPending}, retrieveWorkflowConfigurations] =
        useAsyncFn(async () => {
            try {
                const res = await fetchWorkflowConfigurations()
                setWorkflowConfigurations(res)
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Could not fetch Flows, please try again later.',
                    })
                )
            }
        }, [])

    useEffect(() => {
        void retrieveSelfServiceConfigurations()
    }, [retrieveSelfServiceConfigurations])
    useEffect(() => {
        void retrieveWorkflowConfigurations()
    }, [retrieveWorkflowConfigurations])

    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )

    const quickResponseDisabled = selfServiceConfigurations.every((config) =>
        config.quick_response_policies.every(
            (policy) => policy.deactivated_datetime
        )
    )

    const reportIssueDisabled = selfServiceConfigurations.every(
        (config) => !config.report_issue_policy.enabled
    )

    const returnOrderDisabled = selfServiceConfigurations.every(
        (config) => !config.return_order_policy.enabled
    )

    const articleRecommendationDisabled = selfServiceConfigurations.every(
        (config) => !config.article_recommendation_help_center_id
    )

    const [overview, isFetchingOverview] =
        useStatResource<OneDimensionalUnionChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_OVERVIEW,
            statsFilters: pageStatsFilters,
        })

    const immutableOverview = useMemo(() => {
        return fromJS(overview || {}) as Map<any, any>
    }, [overview])

    const overviewNoData =
        overview?.data.data.every((data) => data.value === 0) || false

    const [volumePerFlow, isFetchingVolumePerFlow] = useStatResource<
        TwoDimensionalChart<AnyStatAxisValue, DataStatLine>
    >({
        statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
        resourceName: SELF_SERVICE_VOLUME_PER_FLOW,
        statsFilters: pageStatsFilters,
    })

    // Check that every datapoint in every line is 0
    const volumePerFlowNoData =
        volumePerFlow?.data.data.lines.every((line) =>
            line.data.every((data) => data === 0)
        ) || false

    const [workflowsPerformance, isFetchingWorkflowsPerformance] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_WORKFLOWS_PERFORMANCE,
            statsFilters: pageStatsFilters,
        })

    const workflowsPerformanceNoData =
        (workflowsPerformance?.data.data.lines.length ?? 0) === 0

    const [quickResponsePerformance, isFetchingQuickResponsePerformance] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE,
            statsFilters: pageStatsFilters,
        })

    const quickResponsePerformanceNoData =
        (quickResponsePerformance?.data.data.lines.length ?? 0) === 0

    const [
        articleRecommendationPerformance,
        isFetchingArticleRecommendationPerformance,
    ] = useStatResource<TwoDimensionalChart>({
        statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
        resourceName: SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE,
        statsFilters: pageStatsFilters,
    })

    const articleRecommendationPerformanceNoData =
        (articleRecommendationPerformance?.data.data.lines.length ?? 0) === 0

    const [topReportedIssues, isFetchingTopReportedIssues] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_TOP_REPORTED_ISSUES,
            statsFilters: pageStatsFilters,
        })

    const topReportedIssuesNoData =
        (topReportedIssues?.data.data.lines.length ?? 0) === 0

    const [
        productsWithMostIssuesAndReturnRequests,
        isFetchingProductsWithMostIssuesAndReturnRequests,
    ] = useStatResource<TwoDimensionalChart>({
        statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
        resourceName:
            SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS,
        statsFilters: pageStatsFilters,
    })

    const productsWithMostIssuesAndReturnRequestsNoData =
        (productsWithMostIssuesAndReturnRequests?.data.data.lines.length ??
            0) === 0

    const handleIntegrationsFilterChange = useCallback(
        (values) => {
            dispatch(mergeStatsFilters({integrations: values as number[]}))
        },
        [dispatch]
    )

    const allSectionsNoData =
        overviewNoData &&
        volumePerFlowNoData &&
        workflowsPerformanceNoData &&
        quickResponsePerformanceNoData &&
        articleRecommendationPerformanceNoData &&
        topReportedIssuesNoData &&
        productsWithMostIssuesAndReturnRequestsNoData

    if (isSelfServiceFetchPending || isWorkflowsFetchPending) {
        return <Loader />
    }

    return (
        <StatsPage
            title={PAGE_TITLE}
            description={PAGE_DESCRIPTION}
            helpUrl={HELP_URL}
            filters={
                pageStatsFilters && (
                    <>
                        <SelfServiceIntegrationsFilter
                            onChange={handleIntegrationsFilterChange}
                            value={pageStatsFilters.integrations}
                        />
                        <PeriodStatsFilter value={pageStatsFilters.period} />
                    </>
                )
            }
        >
            {pageStatsFilters && (
                <>
                    <KeyMetricStatWrapper>
                        <KeyMetricStat
                            data={immutableOverview.getIn(['data', 'data'])}
                            meta={immutableOverview.get('meta')}
                            loading={isFetchingOverview}
                            config={statsConfig.get(AUTOMATION_ADD_ON_OVERVIEW)}
                        />
                    </KeyMetricStatWrapper>
                    {allSectionsNoData && !noActivityAlertDismissed && (
                        <Alert
                            type={AlertType.Error}
                            className={css.noActivityAlert}
                            icon
                            onClose={() => {
                                setNoActivityAlertDismissed(true)
                            }}
                        >
                            There is no activity for these features. Your chat
                            or help center may not be properly installed.
                        </Alert>
                    )}
                    <StatWrapper
                        stat={volumePerFlow}
                        statDataLabelOverride="Volume per flow"
                        isFetchingStat={isFetchingVolumePerFlow}
                        resourceName={SELF_SERVICE_VOLUME_PER_FLOW}
                        statsFilters={pageStatsFilters}
                        isDownloadable
                    >
                        {(stat) => (
                            <NormalizedLineStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(
                                    SELF_SERVICE_VOLUME_PER_FLOW
                                )}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={workflowsPerformance}
                        isFetchingStat={isFetchingWorkflowsPerformance}
                        resourceName={SELF_SERVICE_WORKFLOWS_PERFORMANCE}
                        statsFilters={pageStatsFilters}
                        isDownloadable={!workflowsPerformanceNoData}
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(
                                    SELF_SERVICE_WORKFLOWS_PERFORMANCE
                                )}
                                name={SELF_SERVICE_WORKFLOWS_PERFORMANCE}
                                integrations={integrations}
                                selfServiceConfigurations={
                                    selfServiceConfigurations
                                }
                                workflowConfigurations={workflowConfigurations}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={quickResponsePerformance}
                        isFetchingStat={isFetchingQuickResponsePerformance}
                        resourceName={SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE}
                        statsFilters={pageStatsFilters}
                        helpText={
                            <span>
                                You can enable up to six Quick Response flows at
                                a time to automatically answer shopper
                                questions. Only flows enabled during the
                                selected time period are displayed below.{' '}
                                <a
                                    href="https://docs.gorgias.com/en-US/custom-self-service-flows-81897"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Learn more
                                </a>
                            </span>
                        }
                        helpAutoHide={false}
                        isDownloadable={!quickResponsePerformanceNoData}
                    >
                        {(stat) => (
                            <>
                                {quickResponsePerformanceNoData &&
                                quickResponseDisabled ? (
                                    <SelfServiceFeaturePreview
                                        title="Automate up to 14% of interactions with quick response flows"
                                        description="Enable and display up to 6 custom Quick Response Flows to provide customers with automated responses to common questions."
                                        buttonText="Go to quick response flows"
                                        buttonRedirectUrl="/app/automation"
                                        imageUrl={assetsUrl(
                                            '/img/presentationals/quick-response-preview.png'
                                        )}
                                        imageAltText="Quick response flows feature preview"
                                    />
                                ) : (
                                    <TableStat
                                        context={{tagColors: null}}
                                        data={stat.getIn(['data', 'data'])}
                                        meta={stat.get('meta')}
                                        config={statsConfig.get(
                                            SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE
                                        )}
                                        name={
                                            SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE
                                        }
                                        integrations={integrations}
                                        selfServiceConfigurations={
                                            selfServiceConfigurations
                                        }
                                    />
                                )}
                            </>
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={articleRecommendationPerformance}
                        isFetchingStat={
                            isFetchingArticleRecommendationPerformance
                        }
                        resourceName={
                            SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
                        }
                        statsFilters={pageStatsFilters}
                        helpText={
                            <span>
                                When enabled, relevant articles display in chat
                                to automatically answer customer questions. Only
                                articles recommended during the selected time
                                period are displayed below.{' '}
                                <a
                                    href="https://docs.gorgias.com/en-US/help-center-article-recommendation-in-chat-89341"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Learn more
                                </a>
                            </span>
                        }
                        helpAutoHide={false}
                        isDownloadable={!articleRecommendationPerformanceNoData}
                    >
                        {(stat) => (
                            <>
                                {articleRecommendationPerformanceNoData &&
                                articleRecommendationDisabled ? (
                                    <SelfServiceFeaturePreview
                                        title="Leverage your Help Center to automate tickets"
                                        description="Enable Article Recommendation to automatically recommend relevant help center articles to customers."
                                        buttonText="Go to article recommendation"
                                        buttonRedirectUrl="/app/automation"
                                        imageUrl={assetsUrl(
                                            '/img/presentationals/article-recommendation-preview.png'
                                        )}
                                        imageAltText="Article Recommendation feature preview"
                                    />
                                ) : (
                                    <TableStat
                                        context={{tagColors: null}}
                                        data={stat.getIn(['data', 'data'])}
                                        meta={stat.get('meta')}
                                        config={statsConfig.get(
                                            SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
                                        )}
                                        name={
                                            SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
                                        }
                                    />
                                )}
                            </>
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={topReportedIssues}
                        isFetchingStat={isFetchingTopReportedIssues}
                        resourceName={SELF_SERVICE_TOP_REPORTED_ISSUES}
                        statsFilters={pageStatsFilters}
                        helpText={
                            <span>
                                Only issues configured during the selected time
                                period are displayed below. You can customize
                                possible issues based on order status.{' '}
                                <a
                                    href="https://docs.gorgias.com/self-service/configure-your-self-service-portal"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Learn more
                                </a>
                            </span>
                        }
                        helpAutoHide={false}
                        isDownloadable={!topReportedIssuesNoData}
                    >
                        {(stat) => (
                            <>
                                {topReportedIssuesNoData &&
                                reportIssueDisabled ? (
                                    <SelfServiceFeaturePreview
                                        title="Monitor order issues with the report issue flow"
                                        description="Monitor order issues with the report issue flow"
                                        buttonText="Go to Order Management Flows"
                                        buttonRedirectUrl="/app/automation"
                                        imageUrl={assetsUrl(
                                            '/img/presentationals/report-issue-preview.png'
                                        )}
                                        imageAltText="Report Issue feature preview"
                                    />
                                ) : (
                                    <TableStat
                                        context={{tagColors: null}}
                                        data={stat.getIn(['data', 'data'])}
                                        meta={stat.get('meta')}
                                        config={statsConfig.get(
                                            SELF_SERVICE_TOP_REPORTED_ISSUES
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={productsWithMostIssuesAndReturnRequests}
                        isFetchingStat={
                            isFetchingProductsWithMostIssuesAndReturnRequests
                        }
                        resourceName={
                            SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS
                        }
                        statsFilters={pageStatsFilters}
                        isDownloadable={
                            !productsWithMostIssuesAndReturnRequestsNoData
                        }
                    >
                        {(stat) => (
                            <>
                                {productsWithMostIssuesAndReturnRequestsNoData &&
                                returnOrderDisabled &&
                                reportIssueDisabled ? (
                                    <SelfServiceFeaturePreview
                                        title="Gain product insights by enabling the report issue and return flows"
                                        description="Enable and customize these flows in Order Management Flows."
                                        buttonText="Go to Order Management Flows"
                                        buttonRedirectUrl="/app/automation"
                                        imageUrl={assetsUrl(
                                            '/img/presentationals/return-order-preview.png'
                                        )}
                                        imageAltText="Return Order feature preview"
                                    />
                                ) : (
                                    <TableStat
                                        context={{tagColors: null}}
                                        data={stat.getIn(['data', 'data'])}
                                        meta={stat.get('meta')}
                                        config={statsConfig.get(
                                            SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
    )
}

export default withFeaturePaywall(
    AccountFeature.AutomationSelfServiceStatistics,
    undefined,
    {
        [AccountFeature.AutomationSelfServiceStatistics]: {
            ...defaultPaywallConfigs[
                AccountFeature.AutomationSelfServiceStatistics
            ],
            pageHeader: (
                <PageHeader
                    title={
                        <HeaderTitle
                            title={PAGE_TITLE}
                            description={PAGE_DESCRIPTION}
                            helpUrl={HELP_URL}
                        />
                    }
                />
            ),
            customCta: <SelfServiceStatsPagePaywallCustomCta />,
        } as PaywallConfig,
    }
)(SelfServiceStatsPage)
