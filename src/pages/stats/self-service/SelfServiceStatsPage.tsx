import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'
import {fromJS, Map} from 'immutable'

import {
    SELF_SERVICE_OVERVIEW,
    SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES,
    SELF_SERVICE_FLOWS_DISTRIBUTION,
    SELF_SERVICE_TOP_REPORTED_ISSUES,
    stats as statsConfig,
    SELF_SERVICE_MOST_RETURNED_PRODUCTS,
} from 'config/stats'
import {fetchSelfServiceConfigurations} from 'models/selfServiceConfiguration/resources'
import {
    OneDimensionalUnionChart,
    StatsFilters,
    TwoDimensionalChart,
} from 'models/stat/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {selfServiceConfigurationsFetched} from 'state/entities/selfServiceConfigurations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    currentAccountHasFeature,
    getCurrentAccountState,
} from 'state/currentAccount/selectors'
import {AccountFeature, CurrentAccountState} from 'state/currentAccount/types'
import {RootState} from 'state/types'
import {SegmentEvent} from 'store/middlewares/segmentTracker'
import {DEPRECATED_getCurrentPlan} from 'state/billing/selectors'
import {getStatsFilters} from 'state/stats/selectors'
import {mergeStatsFilters} from 'state/stats/actions'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'

import KeyMetricStat from '../common/components/charts/KeyMetricStat/KeyMetricStat'
import NormalizedBarStat from '../common/components/charts/NormalizedBarStat'
import TableStat from '../common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from '../KeyMetricStatWrapper'
import PeriodStatsFilter from '../PeriodStatsFilter'
import StatsPage from '../StatsPage'
import StatsPageTitle from '../StatsPageTitle'
import StatWrapper from '../StatWrapper'
import useStatResource from '../useStatResource'

import Paywall, {UpgradeType} from '../../common/components/Paywall/Paywall'
import {paywallConfigs} from '../../../config/paywalls'
import SelfServiceIntegrationsFilter from './SelfServiceIntegrationsFilter'
import css from './SelfServiceStatsPage.less'

const AUTOMATION_SELF_SERVICE_STAT_NAME = 'automation-self-service'
const TITLE = 'Self-service'
const DESCRIPTION = (
    <div>
        Self-service statistics give you an overview of the performance of your
        self-service features which can automate tickets and save you time. This
        view shows data from the{' '}
        <b>Chat channels and the Help centers combined</b>.
    </div>
)
const HELP_URL = 'https://docs.gorgias.com/statistics/self-service-statistics'

export const SelfServiceStatsPage = (): JSX.Element => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const dispatch = useAppDispatch()
    const hasSelfServiceStatisticsFeature = useSelector(
        currentAccountHasFeature(AccountFeature.AutomationSelfServiceStatistics)
    )
    const account = useSelector<RootState, CurrentAccountState>(
        getCurrentAccountState
    )
    const currentPlan = useSelector(DEPRECATED_getCurrentPlan)
    const statsFilters = useSelector(getStatsFilters)

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
            current_plan: currentPlan.get('id'),
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

    const [overview, isFetchingOverview] =
        useStatResource<OneDimensionalUnionChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_OVERVIEW,
            statsFilters: pageStatsFilters,
        })

    const immutableOverview = useMemo(() => {
        return fromJS(overview || {}) as Map<any, any>
    }, [overview])

    const [flowsDistribution, isFetchingFlowsDistribution] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_FLOWS_DISTRIBUTION,
            statsFilters: pageStatsFilters,
        })

    const [productWithMostIssues, isFetchingProductWithMostIssues] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES,
            statsFilters: pageStatsFilters,
        })

    const [topReportedIssues, isFetchingTopReportedIssues] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_TOP_REPORTED_ISSUES,
            statsFilters: pageStatsFilters,
        })

    const [mostReturnedProducts, isFetchingMostReturnedProducts] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_SELF_SERVICE_STAT_NAME,
            resourceName: SELF_SERVICE_MOST_RETURNED_PRODUCTS,
            statsFilters: pageStatsFilters,
        })

    const handleIntegrationsFilterChange = useCallback(
        (values) => {
            dispatch(mergeStatsFilters({integrations: values as number[]}))
        },
        [dispatch]
    )

    const paywallConfig =
        paywallConfigs[AccountFeature.AutomationSelfServiceStatistics]!

    if (loading) {
        return <Loader />
    } else if (!hasSelfServiceStatisticsFeature) {
        return (
            <Paywall
                pageHeader={
                    <PageHeader
                        title={
                            <StatsPageTitle
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
                    <UpgradeButton
                        onClick={() => {
                            setIsAutomationModalOpened(true)
                        }}
                        label="Get Automation Features"
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
                            config={statsConfig.get(SELF_SERVICE_OVERVIEW)}
                        />
                    </KeyMetricStatWrapper>
                    <StatWrapper
                        stat={flowsDistribution}
                        isFetchingStat={isFetchingFlowsDistribution}
                        resourceName={SELF_SERVICE_FLOWS_DISTRIBUTION}
                        statsFilters={pageStatsFilters}
                        isDownloadable
                    >
                        {(stat) => (
                            <NormalizedBarStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(
                                    SELF_SERVICE_FLOWS_DISTRIBUTION
                                )}
                            />
                        )}
                    </StatWrapper>
                    <h3 className={css.section}>Report issues flow</h3>
                    <StatWrapper
                        stat={productWithMostIssues}
                        isFetchingStat={isFetchingProductWithMostIssues}
                        resourceName={SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES}
                        statsFilters={pageStatsFilters}
                        isDownloadable
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(
                                    SELF_SERVICE_PRODUCTS_WITH_MOST_ISSUES
                                )}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={topReportedIssues}
                        isFetchingStat={isFetchingTopReportedIssues}
                        resourceName={SELF_SERVICE_TOP_REPORTED_ISSUES}
                        statsFilters={pageStatsFilters}
                        helpText={
                            <span>
                                Only the reasons you have configured will be
                                displayed below. You can also customize the list
                                of reasons available to your customers depending
                                on the order statuses.{' '}
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
                        isDownloadable
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(
                                    SELF_SERVICE_TOP_REPORTED_ISSUES
                                )}
                            />
                        )}
                    </StatWrapper>
                    <h3 className={css.section}>Returns flow</h3>
                    <StatWrapper
                        stat={mostReturnedProducts}
                        isFetchingStat={isFetchingMostReturnedProducts}
                        resourceName={SELF_SERVICE_MOST_RETURNED_PRODUCTS}
                        statsFilters={pageStatsFilters}
                        isDownloadable
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(
                                    SELF_SERVICE_MOST_RETURNED_PRODUCTS
                                )}
                            />
                        )}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
    )
}
export default SelfServiceStatsPage
