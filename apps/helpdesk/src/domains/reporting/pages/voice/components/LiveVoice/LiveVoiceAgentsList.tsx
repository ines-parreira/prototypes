import { useMemo } from 'react'

import type { LiveCallQueueAgent } from '@gorgias/helpdesk-queries'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import LiveVoiceAgentRow from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentRow'
import css from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsList.less'
import {
    AgentStatusCategory,
    groupAgentsByStatus,
    recomputeAgentsWithOnlineStatusChange,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import type { WithChildren } from 'pages/common/components/table/TableBodyRowExpandable'
import { TableBodyRowExpandable } from 'pages/common/components/table/TableBodyRowExpandable'
import TableWrapper from 'pages/common/components/table/TableWrapper'

type Props = {
    agents: LiveCallQueueAgent[]
}

export default function LiveVoiceAgentsList({ agents }: Props) {
    const { onlineAgents } = useAgentsOnlineStatus()

    const data: WithChildren<Data>[] = useMemo(() => {
        const agentsWithOnlineStatus = recomputeAgentsWithOnlineStatusChange(
            agents,
            onlineAgents,
        )
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
    }, [agents, onlineAgents])

    return (
        <TableWrapper>
            <TableBody>
                {data.map((row, index) => (
                    <TableBodyRowExpandable<WithChildren<Data>, undefined>
                        key={index}
                        RowContentComponent={Row}
                        rowContentProps={row}
                        innerClassName={css.cellInner}
                        tableBodyRowProps={{
                            className: css.row,
                        }}
                        isDefaultExpanded
                        tableProps={undefined}
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
