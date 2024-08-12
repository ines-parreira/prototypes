import React from 'react'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import {
    TableBodyRowExpandable,
    WithChildren,
} from 'pages/common/components/table/TableBodyRowExpandable'

import css from './LiveVoiceAgentsList.less'

type AgentData = {
    agent: {
        id: string
        name: string
    }
    type: 'agent'
}

type CategoryData = {
    label: string
    type: 'category'
}

type Data = CategoryData | AgentData

export default function LiveVoiceAgentsList() {
    const data: WithChildren<Data>[] = [
        {
            label: 'Busy',
            type: 'category',
            children: [
                {
                    agent: {
                        id: '1',
                        name: 'Agent 1',
                    },
                    type: 'agent',
                    children: [],
                },
                {
                    agent: {
                        id: '2',
                        name: 'Agent 2',
                    },
                    type: 'agent',
                    children: [],
                },
            ],
        },
        {
            label: 'Available',
            type: 'category',
            children: [
                {
                    agent: {
                        id: '3',
                        name: 'Agent 3',
                    },
                    type: 'agent',
                    children: [],
                },
            ],
        },
        {
            label: 'Unavailable',
            type: 'category',
            children: [
                {
                    agent: {
                        id: '4',
                        name: 'Agent 4',
                    },
                    type: 'agent',
                    children: [],
                },
            ],
        },
    ]

    return (
        <>
            <div className={css.title}>Agents</div>
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
        </>
    )
}

const Row = (row: WithChildren<Data>) =>
    row.type === 'category' ? (
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
