import React, {useMemo, useState} from 'react'

import {useHistory} from 'react-router-dom'

import classNames from 'classnames'
import moment from 'moment'
import useAppSelector from 'hooks/useAppSelector'

import {
    useAutomatedInteractionsTrend,
    useAutomationRateTrend,
    useFirstResponseTimeWithAutomationTrend,
    useResolutionTimeWithAutomationTrend,
} from 'hooks/reporting/metricTrends'
import {getTimezone} from 'state/currentUser/selectors'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import TipsToggle from 'pages/stats/TipsToggle'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import StatsPage from 'pages/stats/StatsPage'
import {useGetCostPerAutomatedInteraction} from '../hooks/useGetCostPerAutomatedInteraction'
import {useGetCostPerBillableTicket} from '../hooks/useGetCostPerBillableTicket'
import {
    AutomatedInteractionsMetric,
    AutomationRateMetric,
} from '../../automate-metrics'
import {AGENT_COST_PER_TICKET} from '../../automate-metrics/constants'
import {AutomateSavingsCard} from './AutomateSavingsCard'
import css from './AutomateLandingPage.less'

const DEFAULT_TIMEZONE = 'UTC'

const MIN_AUTOMATED_INTERACTIONS = 20

const AutomateLandingPage = () => {
    const filterDates = useMemo(() => {
        const nowLess28DaysDatetime = moment()
            .subtract(28, 'days')
            .startOf('day')
            .format()

        const nowDatetime = moment().endOf('day').format()

        return {
            nowDatetime,
            nowLess28DaysDatetime,
        }
    }, [])

    const {nowDatetime, nowLess28DaysDatetime} = filterDates

    const filters = {
        period: {
            end_datetime: nowDatetime,
            start_datetime: nowLess28DaysDatetime,
        },
    }

    const history = useHistory()
    const costPerAutomatedInteraction = useGetCostPerAutomatedInteraction()
    const costPerBillableTicket = useGetCostPerBillableTicket()
    const moneySavedPerInteraction =
        costPerBillableTicket +
        AGENT_COST_PER_TICKET -
        costPerAutomatedInteraction

    const [isTipsVisible, setIsTipVisible] = useState(true)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const automationRateTrend = useAutomationRateTrend(filters, userTimezone)

    const automatedInteractionsTrend = useAutomatedInteractionsTrend(
        filters,
        userTimezone
    )
    const resolutionTimeTrend = useResolutionTimeWithAutomationTrend(
        filters,
        userTimezone
    )
    const firstResponseTimeTrend = useFirstResponseTimeWithAutomationTrend(
        filters,
        userTimezone
    )

    const handleViewFullReport = () => {
        history.push(`/app/stats/automate-overview?source=automate`)
    }

    const isLoading =
        automatedInteractionsTrend.isFetching ||
        resolutionTimeTrend.isFetching ||
        firstResponseTimeTrend.isFetching

    if (isLoading) {
        return <Loader />
    }

    return (
        <StatsPage title="Automate">
            <DashboardSection
                title="Impact"
                titleExtra={
                    <>
                        <div className={css.dashboardTitleContainer}>
                            <div className={css.dashboardTipsCta}>
                                <span
                                    className={classNames(
                                        'mr-2',
                                        css.durationText
                                    )}
                                >
                                    in the last 28 days
                                </span>
                                <TipsToggle
                                    isVisible={true}
                                    onClick={() =>
                                        setIsTipVisible((prev) => !prev)
                                    }
                                />
                            </div>
                            <Button
                                fillStyle="ghost"
                                onClick={handleViewFullReport}
                            >
                                View Full Report
                                <i
                                    className="material-icons"
                                    style={{fontSize: 20}}
                                    aria-label="arrow forward"
                                >
                                    arrow_forward
                                </i>
                            </Button>
                        </div>
                    </>
                }
            >
                <>
                    <DashboardGridCell size={6}>
                        <AutomationRateMetric
                            trend={automationRateTrend}
                            showTips={isTipsVisible}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <AutomatedInteractionsMetric
                            trend={automatedInteractionsTrend}
                            showTips={isTipsVisible}
                        />
                    </DashboardGridCell>
                    {MIN_AUTOMATED_INTERACTIONS && !isLoading && (
                        <DashboardGridCell size={12}>
                            <AutomateSavingsCard
                                amountSaved={
                                    (automatedInteractionsTrend?.data?.value ??
                                        0) * moneySavedPerInteraction
                                }
                                teamTimeSaved={resolutionTimeTrend.data?.value}
                                customersTimeSaved={
                                    firstResponseTimeTrend.data?.value
                                }
                            />
                        </DashboardGridCell>
                    )}
                </>
            </DashboardSection>
            <section data-candu-id="automate-landing-page-checklist" />
        </StatsPage>
    )
}
export default AutomateLandingPage
