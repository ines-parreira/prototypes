import { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'

import { OrderDirection } from 'models/api/types'
import { TableWithNestedRows } from 'pages/stats/common/components/Table/TableWithNestedRows'

const storyConfig: Meta = {
    title: 'Stats/Table With Nested Rows',
    component: TableWithNestedRows,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof TableWithNestedRows>> = (
    props,
) => {
    const RowComponent = ({
        entityId,
        level2EntityId,
        level,
        columnOrder,
    }: {
        entityId: string
        level2EntityId?: string
        level?: number
        columnOrder?: string[]
    }) => (
        <>
            {(columnOrder ?? []).map((column) => (
                <td
                    key={column}
                >{`${level2EntityId ?? entityId} (level: ${level})`}</td>
            ))}
        </>
    )

    return (
        <div>
            <TableWithNestedRows {...props} RowComponent={RowComponent} />
        </div>
    )
}

enum SomeColumn {
    A = 'column-a',
    B = 'column-b',
}

const exampleRowData = [
    {
        entityId: '1',
        children: [
            { entityId: '1', level2EntityId: 'X', children: [] },
            { entityId: '1', level2EntityId: 'Y', children: [] },
            { entityId: '1', level2EntityId: 'Z', children: [] },
        ],
    },
    {
        entityId: '2',
        children: [
            { entityId: '2', level2EntityId: 'A', children: [] },
            { entityId: '2', level2EntityId: 'B', children: [] },
            { entityId: '2', level2EntityId: 'C', children: [] },
        ],
    },
    {
        entityId: '3',
        children: [
            { entityId: '3', level2EntityId: 'Q', children: [] },
            { entityId: '3', level2EntityId: 'W', children: [] },
            { entityId: '3', level2EntityId: 'E', children: [] },
        ],
    },
]

const exampleColumnConfig = {
    [SomeColumn.A]: {
        title: 'A title',
        tooltip: { title: 'A tooltip' },
        useData: () => ({ value: 'someValue' }),
    },
    [SomeColumn.B]: {
        title: 'B title',
        tooltip: { title: 'B tooltip' },
        useData: () => ({ value: 'someValue' }),
    },
}

const defaultProps: Partial<ComponentProps<typeof TableWithNestedRows>> = {
    // RowComponent: RowComponent,
    rows: exampleRowData,
    perPage: 2,
    columnOrder: [SomeColumn.A, SomeColumn.B],
    leadColumn: SomeColumn.A,
    sortingOrder: {
        column: SomeColumn.B,
        direction: OrderDirection.Asc,
    },
    getSetOrderHandler: (column: string) => () => {
        alert(`Setting order for ${column}`)
    },
    columnConfig: exampleColumnConfig,
}

export const Default = { render: Template, args: defaultProps }

export default storyConfig
