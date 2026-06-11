import React from 'react'

import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { Skeleton } from '@gorgias/axiom'

import type { Props as KeyMetricCellProps } from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricCell'
import cellCss from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricCell.less'
import { KeyMetricCellWrapper } from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricCellWrapper'
import { formatNumber } from 'domains/reporting/pages/common/utils'
import type { LiveAgentUser } from 'domains/reporting/pages/live/agents/dataTable/hooks/useLiveAgentsUsers'
import css from 'domains/reporting/pages/live/overview/AgentStatusKeyMetricCell.less'
import { useLiveOverviewAgentStatus } from 'domains/reporting/pages/live/overview/useLiveOverviewAgentStatus'

const MAX_TOOLTIP_AGENTS = 25

function renderAgentsTooltip(agents: LiveAgentUser[]) {
    if (agents.length === 0) {
        return null
    }

    const remaining = agents.length - MAX_TOOLTIP_AGENTS

    return (
        <div className={css.tooltipWrapper}>
            {agents.slice(0, MAX_TOOLTIP_AGENTS).map((agent) => (
                <div key={agent.id}>{agent.name}</div>
            ))}
            {remaining > 0 && (
                <Link to="/app/stats/live-agents">+{remaining} more</Link>
            )}
        </div>
    )
}

type AgentStatusKeyMetricCellProps = Pick<
    KeyMetricCellProps,
    'metricConfig' | 'id'
> & {
    agents: LiveAgentUser[]
    isLoading: boolean
}

function AgentStatusKeyMetricCell({
    metricConfig,
    id,
    agents,
    isLoading,
}: AgentStatusKeyMetricCellProps) {
    return (
        <KeyMetricCellWrapper
            label={metricConfig.get('label')}
            tooltipId={`title-${id}`}
            tooltip={renderAgentsTooltip(agents)}
        >
            <div className={classnames('mt-3', cellCss.statsDisplay)}>
                <div className={cellCss.value}>
                    {isLoading ? (
                        <Skeleton width={36} />
                    ) : (
                        formatNumber(agents.length)
                    )}
                </div>
            </div>
        </KeyMetricCellWrapper>
    )
}

export function AgentsOnlineKeyMetricCell(props: KeyMetricCellProps) {
    const { onlineAgents, isLoading } = useLiveOverviewAgentStatus()

    return (
        <AgentStatusKeyMetricCell
            {...props}
            agents={onlineAgents}
            isLoading={isLoading}
        />
    )
}

export function AgentsOfflineKeyMetricCell(props: KeyMetricCellProps) {
    const { offlineAgents, isLoading } = useLiveOverviewAgentStatus()

    return (
        <AgentStatusKeyMetricCell
            {...props}
            agents={offlineAgents}
            isLoading={isLoading}
        />
    )
}
