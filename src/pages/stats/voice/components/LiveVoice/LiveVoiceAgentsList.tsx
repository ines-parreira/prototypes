import React, { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { LiveCallQueueAgent } from '@gorgias/helpdesk-queries'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { FeatureFlagKey } from 'config/featureFlags'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import {
    TableBodyRowExpandable,
    WithChildren,
} from 'pages/common/components/table/TableBodyRowExpandable'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import LiveVoiceAgentRow from './LiveVoiceAgentRow'
import {
    AgentStatusCategory,
    groupAgentsByStatus,
    recomputeAgentsWithOnlineStatusChange,
} from './utils'

import css from './LiveVoiceAgentsList.less'

type Props = {
    agents: LiveCallQueueAgent[]
}

export default function LiveVoiceAgentsList({ agents }: Props) {
    const useLiveUpdates = useFlags()[FeatureFlagKey.UseLiveVoiceUpdates]
    const { onlineAgents } = useAgentsOnlineStatus()

    const data: WithChildren<Data>[] = useMemo(() => {
        const agentsWithOnlineStatus = useLiveUpdates
            ? recomputeAgentsWithOnlineStatusChange(agents, onlineAgents)
            : agents
        const categories = groupAgentsByStatus(agentsWithOnlineStatus)

        return [
            AgentStatusCategory.Busy,
            AgentStatusCategory.Available,
            AgentStatusCategory.Unavailable,
        ].map((categoryName) => {
            const agentsInCategory = categories[categoryName]

            const agentsRowData: WithChildren<AgentData>[] =
                agentsInCategory.map((agent) => ({
                    agent,
                    type: DataType.Agent,
                    children: [],
                }))

            const categoryRowData: WithChildren<Data> = {
                label: `${categoryName} (${agentsInCategory.length})`,
                type: DataType.Category,
                children: agentsRowData,
            }

            return categoryRowData
        })
    }, [agents, onlineAgents, useLiveUpdates])

    return (
        <TableWrapper>
            <TableBody>
                {data.map((row, index) => (
                    <TableBodyRowExpandable<WithChildren<Data>>
                        key={index}
                        RowContentComponent={Row}
                        rowContentProps={row}
                        innerClassName={css.cellInner}
                        tableBodyRowProps={{
                            className: css.row,
                        }}
                        isDefaultExpanded
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}

enum DataType {
    Category = 'category',
    Agent = 'agent',
}

type AgentData = {
    agent: LiveCallQueueAgent
    type: DataType.Agent
}

type CategoryData = {
    label: string
    type: DataType.Category
}

type Data = CategoryData | AgentData

const Row = (row: WithChildren<Data>) =>
    row.type === DataType.Category ? (
        <BodyCell innerClassName={css.categoryCell}>{row.label}</BodyCell>
    ) : (
        <LiveVoiceAgentRow agent={row.agent} />
    )
