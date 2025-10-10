import React, { useState } from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router-dom'

import { LegacyButton as Button, LoadingSpinner } from '@gorgias/axiom'

import { useAutomateMetricsTrend } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { useTicketHandleTimeTrend } from 'domains/reporting/hooks/metricTrends'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import useAppSelector from 'hooks/useAppSelector'
import {
    AutomatedInteractionsMetric,
    AutomationRateMetric,
} from 'pages/automate/automate-metrics'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import css from 'pages/automate/common/components/AutomateLandingPage.less'
import { AutomateSavingsCard } from 'pages/automate/common/components/AutomateSavingsCard'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import TipsToggle from 'pages/common/components/TipsToggle/TipsToggle'
import { getAgentCostsSettings } from 'state/currentAccount/selectors'
import { getTimezone } from 'state/currentUser/selectors'

const DEFAULT_TIMEZONE = 'UTC'

const MIN_AUTOMATED_INTERACTIONS = 20

type Props = {
    filters: StatsFilters
}

const AutomateLandingPageDashboardV2 = ({ filters }: Props) => {
    const moneySavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const agentCosts = useAppSelector(getAgentCostsSettings)

    const history = useHistory()

    const [isTipsVisible, setIsTipVisible] = useState(false)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const {
        automatedInteractionTrend,
        automationRateTrend,
        decreaseInFirstResponseTimeTrend,
        decreaseInResolutionTimeTrend,
    } = useAutomateMetricsTrend(filters, userTimezone)

    const ticketHandleTimeTrend = useTicketHandleTimeTrend(
        filters,
        userTimezone,
    )

    const handleViewFullReport = () => {
        history.push(`/app/stats/ai-agent-overview?source=automate`)
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
                                style={{ fontSize: 20 }}
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
