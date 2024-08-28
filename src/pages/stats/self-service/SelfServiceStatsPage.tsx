import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {parse} from 'csv-parse/sync' // eslint-disable-line import/no-unresolved
import {stringify} from 'csv-stringify/sync' // eslint-disable-line import/no-unresolved
import moment from 'moment'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import {
    SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE,
    SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES_AND_RETURN_REQUESTS,
    SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE,
    SELF_SERVICE_TOP_REPORTED_ISSUES,
    SELF_SERVICE_WORKFLOWS_PERFORMANCE,
    stats as statsConfig,
} from 'config/stats'
import useStatResource from 'hooks/reporting/useStatResource'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import {LegacyStatsFilters, TwoDimensionalChart} from 'models/stat/types'
import {ORDER_MANAGEMENT} from 'pages/automate/common/components/constants'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import withEcommerceIntegration from 'pages/automate/common/utils/withStoreIntegrations'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {useGetAIArticles} from 'pages/settings/helpCenter/queries'
import {DEPRECATED_SelfServiceStatsPageFilters} from 'pages/stats/self-service/DEPRECATED_SelfServiceStatsPageFilters'
import {AccountFeature} from 'state/currentAccount/types'
import {getIntegrations} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {assetsUrl} from 'utils'
import {useGetSelfServiceConfigurations} from 'models/selfServiceConfiguration/queries'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'

import TableStat from '../common/components/charts/TableStat/TableStat'
import {DEFAULT_LOCALE} from '../common/utils'
import StatsPage from '../StatsPage'
import StatWrapper from '../StatWrapper'
import AIBanner from '../help-center/components/AIBanner'
import {
    AUTOMATION_SELF_SERVICE_STAT_NAME,
    HELP_URL,
    PAGE_DESCRIPTION,
    PAGE_TITLE_PERFORMANCE_BY_FEATURES,
} from './constants'
import {SelfServiceFeaturePreview} from './SelfServiceFeaturePreview'

import css from './SelfServiceStatsPage.less'
import SelfServiceStatsPagePaywallCustomCta from './SelfServiceStatsPagePaywallCustomCta'

const QUICK_RESPONSE_DEPRECATION_DATE = '2024-08-15'

export const SelfServiceStatsPage = (): JSX.Element => {
    const isFlowsBuilderAnalyticsEnabled =
        useFlags()[FeatureFlagKey.FlowsBuilderAnalytics]
    const [noActivityAlertDismissed, setNoActivityAlertDismissed] =
        useState(false)

    const dispatch = useAppDispatch()
    const integrations = useAppSelector(getIntegrations)
    const {cleanStatsFilters: statsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const {period, integrations} = statsFilters
        return {
            period,
            integrations,
        }
    }, [statsFilters])

    const {
        isLoading: isWorkflowsFetchPending,
        data: workflowConfigurations,
        isError: isWorkflowConfigurationsFetchError,
    } = useGetWorkflowConfigurations()
    const storeIntegrations = useStoreIntegrations()

    useEffect(() => {
        if (isWorkflowConfigurationsFetchError) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not fetch Flows, please try again later.',
                })
            )
        }
    }, [dispatch, isWorkflowConfigurationsFetchError])

    const refineDownloadedWorkflows = useCallback(
        (csvData: string): string => {
            try {
                if (!workflowConfigurations?.length || !csvData) return csvData
                const flows = parse(csvData, {columns: true}) as {
                    Flow: string
                    [key: string]: any
                }[]
                if (!flows?.length) return csvData
                flows.forEach((flow) => {
                    flow.Flow =
                        workflowConfigurations.find(
                            (configuration) => configuration.id === flow.Flow
                        )?.name ?? flow.Flow
                })
                return stringify(flows, {
                    header: true,
                })
            } catch (err) {
                console.error(
                    'Error while renaming configurationId to Flow name',
                    err
                )
            }
            return csvData
        },
        [workflowConfigurations]
    )

    const {
        data: selfServiceConfigurations = [],
        isLoading: isSelfServiceFetchPending,
    } = useGetSelfServiceConfigurations({
        onError: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Could not fetch Self-service configurations, please try again later.',
                })
            )
        },
    })

    const reportIssueDisabled = selfServiceConfigurations.every(
        (config) => !config.reportIssuePolicy.enabled
    )

    const returnOrderDisabled = selfServiceConfigurations.every(
        (config) => !config.returnOrderPolicy.enabled
    )

    const articleRecommendationDisabled = selfServiceConfigurations.every(
        (config) => !config.articleRecommendationHelpCenterId
    )

    const articleRecommendationHelpCenterIds = selfServiceConfigurations
        .filter((config) => config.articleRecommendationHelpCenterId)
        .map((config) => config.articleRecommendationHelpCenterId)

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

    const {data: fetchedArticles, isLoading: isLoadingAIArticles} =
        useGetAIArticles(DEFAULT_LOCALE)

    const articleRecommendationWithAIArticleHelpCenterId =
        fetchedArticles &&
        articleRecommendationHelpCenterIds.find(
            (helpCenterId) =>
                !fetchedArticles.every(({reviews}) =>
                    reviews?.some(
                        (review) => review.help_center_id === helpCenterId
                    )
                )
        )

    const productsWithMostIssuesAndReturnRequestsNoData =
        (productsWithMostIssuesAndReturnRequests?.data.data.lines.length ??
            0) === 0

    const buildCtaRedirectUrl = useCallback(
        (
            feature: 'orderManagement' | 'articleRecommendation' | 'trainMyAi'
        ) => {
            if (!storeIntegrations.length) return '/app/automation/'

            const [firstIntegration] = storeIntegrations
            const firstIntegrationShopName =
                getShopNameFromStoreIntegration(firstIntegration)

            switch (feature) {
                case 'orderManagement':
                    return `/app/automation/${firstIntegration.type}/${firstIntegrationShopName}/order-management`
                case 'articleRecommendation':
                    return `/app/automation/${firstIntegration.type}/${firstIntegrationShopName}/article-recommendation`
                case 'trainMyAi':
                    return `/app/automation/${firstIntegration.type}/${firstIntegrationShopName}/train-my-ai`
                default:
                    return '/app/automation/'
            }
        },
        [storeIntegrations]
    )

    const allSectionsNoData =
        workflowsPerformanceNoData &&
        quickResponsePerformanceNoData &&
        articleRecommendationPerformanceNoData &&
        topReportedIssuesNoData &&
        productsWithMostIssuesAndReturnRequestsNoData

    const isDateAfter15thOfAug = useMemo(
        () =>
            moment(pageStatsFilters.period.start_datetime).isAfter(
                moment(QUICK_RESPONSE_DEPRECATION_DATE)
            ),
        [pageStatsFilters]
    )
    if (isSelfServiceFetchPending || isWorkflowsFetchPending) {
        return <Loader data-testid="self-service-loader" />
    }

    return (
        <StatsPage
            title={PAGE_TITLE_PERFORMANCE_BY_FEATURES}
            description={PAGE_DESCRIPTION}
            helpUrl={HELP_URL}
            titleExtra={<DEPRECATED_SelfServiceStatsPageFilters />}
        >
            {pageStatsFilters && (
                <>
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
                        stat={workflowsPerformance}
                        isFetchingStat={isFetchingWorkflowsPerformance}
                        resourceName={SELF_SERVICE_WORKFLOWS_PERFORMANCE}
                        statsFilters={pageStatsFilters}
                        isDownloadable={!workflowsPerformanceNoData}
                        refineDownload={refineDownloadedWorkflows}
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
                                isFlowsBuilderAnalyticsEnabled={
                                    isFlowsBuilderAnalyticsEnabled
                                }
                                statsFilters={pageStatsFilters}
                            />
                        )}
                    </StatWrapper>
                    {isDateAfter15thOfAug ? (
                        <></>
                    ) : (
                        <StatWrapper
                            stat={quickResponsePerformance}
                            isFetchingStat={isFetchingQuickResponsePerformance}
                            resourceName={
                                SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE
                            }
                            statDataLabelOverride={
                                'Quick Responses performance (removed)'
                            }
                            statsFilters={pageStatsFilters}
                            helpText={
                                <span>
                                    Only Quick Responses enabled during the
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
                        </StatWrapper>
                    )}
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
                        visibilityLink={
                            !articleRecommendationDisabled &&
                            !articleRecommendationPerformanceNoData
                                ? {
                                      href: buildCtaRedirectUrl('trainMyAi'),
                                      label: 'Improve Article Recommendation',
                                      icon: (
                                          <i
                                              className={classnames(
                                                  'material-icons mr-1',
                                                  css.articleLinkIcon
                                              )}
                                          >
                                              auto_awesome
                                          </i>
                                      ),
                                  }
                                : undefined
                        }
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
                                        buttonRedirectUrl={buildCtaRedirectUrl(
                                            'articleRecommendation'
                                        )}
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
                    {!isLoadingAIArticles &&
                        articleRecommendationWithAIArticleHelpCenterId && (
                            <AIBanner
                                helpCenterId={
                                    articleRecommendationWithAIArticleHelpCenterId
                                }
                                className={css.aiBanner}
                                from="self-service-stats-banner"
                            />
                        )}
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
                                        buttonText={`Go to ${ORDER_MANAGEMENT}`}
                                        buttonRedirectUrl={buildCtaRedirectUrl(
                                            'orderManagement'
                                        )}
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
                                        title="Gain product insights by enabling the report issue and return Flows"
                                        description={`Enable and customize these Flows in ${ORDER_MANAGEMENT}.`}
                                        buttonText={`Go to ${ORDER_MANAGEMENT}`}
                                        buttonRedirectUrl={buildCtaRedirectUrl(
                                            'orderManagement'
                                        )}
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
                            title={PAGE_TITLE_PERFORMANCE_BY_FEATURES}
                            description={PAGE_DESCRIPTION}
                            helpUrl={HELP_URL}
                        />
                    }
                />
            ),
            customCta: <SelfServiceStatsPagePaywallCustomCta />,
        } as PaywallConfig,
    }
)(
    withEcommerceIntegration(
        PAGE_TITLE_PERFORMANCE_BY_FEATURES,
        SelfServiceStatsPage
    )
)
