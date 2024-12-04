import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {useAutomateMetricsTrendV2} from 'hooks/reporting/automate/useAutomationDatasetV2'
import {useTicketHandleTimeTrend} from 'hooks/reporting/metricTrends'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import {
    AutomatedInteractionsMetric,
    AutomationRateMetric,
} from 'pages/automate/automate-metrics'
import {AGENT_COST_PER_TICKET} from 'pages/automate/automate-metrics/constants'
import css from 'pages/automate/common/components/AutomateLandingPage.less'
import {AutomateSavingsCard} from 'pages/automate/common/components/AutomateSavingsCard'
import {useMoneySavedPerInteractionWithAutomate} from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import Button from 'pages/common/components/button/Button'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import TipsToggle from 'pages/stats/TipsToggle'
import {getAgentCostsSettings} from 'state/currentAccount/selectors'
import {getTimezone} from 'state/currentUser/selectors'

const DEFAULT_TIMEZONE = 'UTC'

const MIN_AUTOMATED_INTERACTIONS = 20

type Props = {
    filters: StatsFilters
    isAutomateTopQuestionsEnabled: boolean
}

const AutomateLandingPageDashboardV2 = ({
    filters,
    isAutomateTopQuestionsEnabled,
}: Props) => {
    const moneySavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET
    )

    const agentCosts = useAppSelector(getAgentCostsSettings)

    const history = useHistory()

    const [isTipsVisible, setIsTipVisible] = useState(true)

    useEffect(() => {
        setIsTipVisible(!isAutomateTopQuestionsEnabled)
    }, [isAutomateTopQuestionsEnabled])

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const {
        automatedInteractionTrend,
        automationRateTrend,
        decreaseInFirstResponseTimeTrend,
        decreaseInResolutionTimeTrend,
    } = useAutomateMetricsTrendV2(filters, userTimezone)

    const ticketHandleTimeTrend = useTicketHandleTimeTrend(
        filters,
        userTimezone
    )

    const handleViewFullReport = () => {
        history.push(`/app/stats/automate-overview?source=automate`)
    }

    const isLoading =
        automatedInteractionTrend.isFetching ||
        decreaseInResolutionTimeTrend.isFetching ||
        decreaseInFirstResponseTimeTrend.isFetching ||
        ticketHandleTimeTrend.isFetching

    if (isLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <DashboardSection
            title="Performance"
            titleExtra={
                <>
                    <div className={css.dashboardTitleContainer}>
                        <div className={css.dashboardTipsCta}>
                            <span
                                className={classNames('mr-2', css.durationText)}
                            >
                                in the last 28 days
                            </span>
                            <TipsToggle
                                isVisible={isTipsVisible}
                                onClick={() => setIsTipVisible((prev) => !prev)}
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
                        trend={automatedInteractionTrend}
                        showTips={isTipsVisible}
                    />
                </DashboardGridCell>
                {(automatedInteractionTrend?.data?.value ?? 0) >=
                    MIN_AUTOMATED_INTERACTIONS &&
                    !isLoading && (
                        <DashboardGridCell size={12}>
                            <AutomateSavingsCard
                                automatedInteractions={
                                    automatedInteractionTrend?.data?.value
                                }
                                moneySavedPerInteraction={
                                    moneySavedPerInteraction
                                }
                                resolutionTime={
                                    decreaseInResolutionTimeTrend.data?.value
                                }
                                firstResponseTime={
                                    decreaseInFirstResponseTimeTrend.data?.value
                                }
                                ticketHandleTime={
                                    ticketHandleTimeTrend.data?.value
                                }
                                hasAgentCosts={!!agentCosts}
                            />
                        </DashboardGridCell>
                    )}
            </>
        </DashboardSection>
    )
}
export default AutomateLandingPageDashboardV2
