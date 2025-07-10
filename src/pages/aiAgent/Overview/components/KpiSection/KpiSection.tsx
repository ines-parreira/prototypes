import React, { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import { NavLink } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import useAppSelector from 'hooks/useAppSelector'
import { Kpi } from 'pages/aiAgent/components/Kpi/Kpi'
import { CardTitle } from 'pages/aiAgent/Onboarding/components/Card'
import { OverviewCard } from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'
import {
    AiAgentType,
    useAiAgentTypeForAccount,
} from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useKpis } from 'pages/aiAgent/Overview/hooks/useKpis'
import { KpiMetric } from 'pages/aiAgent/Overview/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { STATS_ROUTES } from 'routes/constants'
import { getCleanStatsFiltersWithTimezone } from 'state/ui/stats/selectors'

import css from './KpiSection.less'

const KpiContainer = ({
    isLoading = false,
    metrics,
}: {
    isLoading?: boolean
    metrics?: KpiMetric[]
}) => {
    if (isLoading || !metrics?.length) {
        return (
            <div className={css.kpiContainer}>
                <Kpi isLoading />
                <Kpi isLoading />
                <Kpi isLoading />
                <Kpi isLoading />
            </div>
        )
    }

    return (
        <div className={css.kpiContainer}>
            {metrics
                .filter((it) => !it.hidden)
                .map((metric) => {
                    return (
                        <Kpi
                            key={metric.title}
                            isLoading={metric.isLoading}
                            value={metric.value ?? 0}
                            prevValue={metric.prevValue ?? undefined}
                            title={metric.title}
                            hint={metric.hint}
                            metricFormat={metric.metricFormat}
                            currency={metric.currency}
                            data-candu-id={metric['data-candu-id']}
                            action={metric.action}
                            hideTrend={metric.hideTrend}
                        />
                    )
                })}
        </div>
    )
}

const Kpis = ({
    aiAgentType,
    aiAgentUserId,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
}: {
    aiAgentType?: AiAgentType
    aiAgentUserId: number
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
}) => {
    const { automationRateFilters, filters } = useMemo(() => {
        const start_datetime = moment()
            .subtract(28, 'days')
            .startOf('day')
            .format()

        return {
            automationRateFilters: {
                period: {
                    start_datetime,
                    end_datetime: moment()
                        .subtract(3, 'days')
                        .endOf('day')
                        .format(),
                },
            },
            filters: {
                period: {
                    start_datetime,
                    end_datetime: moment().endOf('day').format(),
                },
            },
        }
    }, [])
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const { metrics } = useKpis({
        automationRateFilters,
        filters,
        timezone: userTimezone,
        aiAgentType,
        aiAgentUserId,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
    })

    return <KpiContainer metrics={metrics} />
}

type Props = {
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
}
export const KpiSection = ({
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
}: Props) => {
    const { isLoading, aiAgentType } = useAiAgentTypeForAccount()
    const aiAgentUserId = useAIAgentUserId()
    const hasAnalytics = useFlags()[FeatureFlagKey.AiShoppingAssistantEnabled]

    const analyticsLink = useMemo(() => {
        if (isLoading) {
            return ''
        }

        if (aiAgentType === 'sales' || aiAgentType === 'mixed') {
            return `/app/stats/${STATS_ROUTES.AI_SALES_AGENT_OVERVIEW}`
        }

        return `/app/stats/${STATS_ROUTES.AUTOMATE_AI_AGENTS}`
    }, [isLoading, aiAgentType])

    if (isLoading || !aiAgentUserId) {
        return (
            <OverviewCard>
                <div className={css.titleWrapper}>
                    <div className={css.title}>
                        <CardTitle>AI Agent performance</CardTitle>
                    </div>
                    <div className={css.subtitle}>
                        Data from last 28 days
                        <IconTooltip className={css.iconTooltip}>
                            Data for the past 72 hours is not included in these
                            metrics, as interactions are considered automated
                            after 72 hours have passed without a customer reply.
                        </IconTooltip>
                    </div>
                </div>

                <KpiContainer isLoading />
            </OverviewCard>
        )
    }

    return (
        <OverviewCard data-candu-id="ai-agent-overview-performance-block">
            <div className={css.titleWrapper}>
                <div className={css.title}>
                    <CardTitle>AI Agent performance</CardTitle>
                    {hasAnalytics && (
                        <NavLink to={analyticsLink} exact>
                            <Button
                                intent="secondary"
                                size="small"
                                trailingIcon="open_in_new"
                                isLoading={isLoading}
                            >
                                View Full Report
                            </Button>
                        </NavLink>
                    )}
                </div>
                <div className={css.subtitle}>
                    Data from last 28 days
                    <IconTooltip className={css.iconTooltip}>
                        Data for the past 72 hours is not included in these
                        metrics, as interactions are considered automated after
                        72 hours have passed without a customer reply.
                    </IconTooltip>
                </div>
            </div>

            <Kpis
                aiAgentType={aiAgentType}
                aiAgentUserId={aiAgentUserId}
                showActivationModal={showActivationModal}
                showEarlyAccessModal={showEarlyAccessModal}
                isOnNewPlan={isOnNewPlan}
            />
        </OverviewCard>
    )
}
