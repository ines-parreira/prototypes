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
    SELF_SERVICE_OVERVIEW_V2,
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
import {
    currentAccountHasFeature,
    getCurrentAccountState,
} from 'state/currentAccount/selectors'
import {AccountFeature, CurrentAccountState} from 'state/currentAccount/types'
import {SegmentEvent} from 'store/middlewares/segmentTracker'
import {getStatsFilters} from 'state/stats/selectors'
import {mergeStatsFilters} from 'state/stats/actions'
import Loader from 'pages/common/components/Loader/Loader'
import HeaderWithInfo from 'pages/common/components/HeaderWithInfo'
import PageHeader from 'pages/common/components/PageHeader'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'
import AutomationSubscriptionButton from 'pages/settings/billing/automation/AutomationSubscriptionButton'

import {getCurrentProducts} from 'state/billing/selectors'
import {getIntegrations} from 'state/integrations/selectors'
import KeyMetricStat from '../common/components/charts/KeyMetricStat/KeyMetricStat'
import TableStat from '../common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from '../KeyMetricStatWrapper'
import PeriodStatsFilter from '../PeriodStatsFilter'
import StatsPage from '../StatsPage'
import StatWrapper from '../StatWrapper'
import useStatResource from '../useStatResource'

import Paywall, {UpgradeType} from '../../common/components/Paywall/Paywall'
import {paywallConfigs} from '../../../config/paywalls'
import NormalizedLineStat from '../common/components/charts/NormalizedLineStat'
import {getSelfServiceConfigurations} from '../../../state/entities/selfServiceConfigurations/selectors'
import Alert, {AlertType} from '../../common/components/Alert/Alert'
import SelfServiceIntegrationsFilter from './SelfServiceIntegrationsFilter'
import css from './SelfServiceStatsPage.less'
import {SelfServiceFeaturePreview} from './SelfServiceFeaturePreview'
import {useIsArticleRecommendationDisabled} from './self-service-stats.utils'

const AUTOMATION_SELF_SERVICE_STAT_NAME = 'automation-self-service'
const TITLE = 'Self-service'
const DESCRIPTION = (
    <div>
        Self-service statistics give you an overview of the performance of your
        self-service features which can automate tickets and save you time. This
        view shows data from <b>chat and help centers combined</b>.
    </div>
)
const HELP_URL = 'https://docs.gorgias.com/statistics/self-service-statistics'

export const SelfServiceStatsPage = (): JSX.Element => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const [noActivityAlertDismissed, setNoActivityAlertDismissed] =
        useState(false)
    const dispatch = useAppDispatch()
    const hasSelfServiceStatisticsFeature = useAppSelector(
        currentAccountHasFeature(AccountFeature.AutomationSelfServiceStatistics)
    )
    const account = useAppSelector<CurrentAccountState>(getCurrentAccountState)
    const currentProducts = useAppSelector(getCurrentProducts)
    const integrations = useAppSelector(getIntegrations)
    const statsFilters = useAppSelector(getStatsFilters)

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {period, integrations} = statsFilters
        return {
            period,
            integrations,
        }
    }, [statsFilters])

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_prices: Object.values(currentProducts || {})?.map(
                (product) => product.price_id
            ),
            paywall_feature: 'automation_addon',
        },
    }
    const [{loading}, retrieveSelfServiceConfigurations] =
        useAsyncFn(async () => {
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

    useEffect(() => {
        void (async () => {
            await retrieveSelfServiceConfigurations()
        })()
    }, [retrieveSelfServiceConfigurations])

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

    const articleRecommendationDisabled = useIsArticleRecommendationDisabled(
        articleRecommendationPerformanceNoData
    )

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

    const paywallConfig =
        paywallConfigs[AccountFeature.AutomationSelfServiceStatistics]!

    const allSectionsNoData =
        overviewNoData &&
        volumePerFlowNoData &&
        quickResponsePerformanceNoData &&
        articleRecommendationPerformanceNoData &&
        topReportedIssuesNoData &&
        productsWithMostIssuesAndReturnRequestsNoData

    if (loading) {
        return <Loader />
    } else if (!hasSelfServiceStatisticsFeature) {
        return (
            <Paywall
                pageHeader={
                    <PageHeader
                        title={
                            <HeaderWithInfo
                                title={TITLE}
                                description={DESCRIPTION}
                                helpUrl={HELP_URL}
                            />
                        }
                    />
                }
                requiredUpgrade="Automation"
                upgradeType={UpgradeType.AddOn}
                header={paywallConfig.header}
                description={paywallConfig.description}
                previewImage={paywallConfig.preview}
                customCta={
                    <AutomationSubscriptionButton
                        onClick={() => {
                            setIsAutomationModalOpened(true)
                        }}
                        label="Add Automation Features"
                        segmentEventToSend={segmentEventToSend}
                    />
                }
                modal={
                    <AutomationSubscriptionModal
                        confirmLabel="Confirm"
                        isOpen={isAutomationModalOpened}
                        onClose={() => setIsAutomationModalOpened(false)}
                    />
                }
            />
        )
    }

    return (
        <StatsPage
            title={TITLE}
            description={DESCRIPTION}
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
                            config={statsConfig.get(SELF_SERVICE_OVERVIEW_V2)}
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
                            There is no Self-service activity. Your Chat or Help
                            Center may not be properly installed.
                        </Alert>
                    )}
                    <StatWrapper
                        stat={volumePerFlow}
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
                        stat={quickResponsePerformance}
                        isFetchingStat={isFetchingQuickResponsePerformance}
                        resourceName={SELF_SERVICE_QUICK_RESPONSE_PERFORMANCE}
                        statsFilters={pageStatsFilters}
                        helpText={
                            <span>
                                You can enable up to four Quick Response flows
                                at a time to automatically answer shopper
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
                                        title="Automate up to 14% of
                                                        interactions with quick
                                                        response flows"
                                        description="Enable and customize up
                                                        to 4 quick response
                                                        flows at a time in
                                                        Self-service."
                                        buttonText="Check out quick response"
                                        buttonRedirectUrl="/app/settings/self-service"
                                        imageUrl={assetsUrl(
                                            '/img/presentationals/quick-response-preview.png'
                                        )}
                                        imageAltText="Quick response feature preview"
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
                                        description="Enable article recommendation in Chat settings to automatically recommend relevant Help Center articles to shoppers."
                                        buttonText="Set up article recommendation"
                                        buttonRedirectUrl="/app/settings/channels/gorgias_chat"
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
                                        title="Track order issues by enabling the report issue flow"
                                        description="Enable and customize the report issue flow in Self-service."
                                        buttonText="Customize Report Issue Flow"
                                        buttonRedirectUrl="/app/settings/self-service"
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
                                        description="Enable and customize these order management flows in Self-service."
                                        buttonText="Check out order management flows"
                                        buttonRedirectUrl="/app/settings/self-service"
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
export default SelfServiceStatsPage
