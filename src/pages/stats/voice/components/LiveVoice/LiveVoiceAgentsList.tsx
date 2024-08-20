import React, {useMemo} from 'react'
import {LiveCallQueueAgent} from '@gorgias/api-queries'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import {
    TableBodyRowExpandable,
    WithChildren,
} from 'pages/common/components/table/TableBodyRowExpandable'

import css from './LiveVoiceAgentsList.less'
import {AgentStatusCategory, groupAgentsByStatus} from './utils'

export default function LiveVoiceAgentsList({agents}: Props) {
    const data: WithChildren<Data>[] = useMemo(() => {
        const categories = groupAgentsByStatus(agents)

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
    }, [agents])

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

type Props = {
    agents: LiveCallQueueAgent[]
}

const Row = (row: WithChildren<Data>) =>
    row.type === DataType.Category ? (
        <CategoryRow category={row} />
    ) : (
        <AgentRow agent={row} />
    )

const CategoryRow = ({category}: {category: CategoryData}) => {
    return (
        <BodyCell innerClassName={css.categoryCell}>{category.label}</BodyCell>
    )
}

const AgentRow = ({agent}: {agent: AgentData}) => {
    return (
        <>
            <BodyCell>{agent.agent.name}</BodyCell>
            <BodyCell>icon</BodyCell>
        </>
    )
}
