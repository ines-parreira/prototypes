import type { ComponentProps } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { TableWithNestedRows } from 'domains/reporting/pages/common/components/Table/TableWithNestedRows'
import { OrderDirection } from 'models/api/types'

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
        value: 100,
        prevValue: 90,
        children: [
            {
                entityId: '1',
                level2EntityId: 'X',
                value: 30,
                prevValue: 25,
                children: [],
            },
            {
                entityId: '1',
                level2EntityId: 'Y',
                value: 40,
                prevValue: 35,
                children: [],
            },
            {
                entityId: '1',
                level2EntityId: 'Z',
                value: 30,
                prevValue: 30,
                children: [],
            },
        ],
    },
    {
        entityId: '2',
        value: 80,
        prevValue: 70,
        children: [
            {
                entityId: '2',
                level2EntityId: 'A',
                value: 25,
                prevValue: 20,
                children: [],
            },
            {
                entityId: '2',
                level2EntityId: 'B',
                value: 30,
                prevValue: 25,
                children: [],
            },
            {
                entityId: '2',
                level2EntityId: 'C',
                value: 25,
                prevValue: 25,
                children: [],
            },
        ],
    },
    {
        entityId: '3',
        value: 60,
        prevValue: 50,
        children: [
            {
                entityId: '3',
                level2EntityId: 'Q',
                value: 20,
                prevValue: 15,
                children: [],
            },
            {
                entityId: '3',
                level2EntityId: 'W',
                value: 20,
                prevValue: 20,
                children: [],
            },
            {
                entityId: '3',
                level2EntityId: 'E',
                value: 20,
                prevValue: 15,
                children: [],
            },
        ],
    },
]

const exampleColumnConfig = {
    [SomeColumn.A]: {
        title: 'A title',
        tooltip: { title: 'A tooltip' },
        useData: () => ({ value: 'someValue' }),
        isSortable: true,
    },
    [SomeColumn.B]: {
        title: 'B title',
        tooltip: { title: 'B tooltip' },
        useData: () => ({ value: 'someValue' }),
        isSortable: true,
    },
}

const defaultProps: Partial<ComponentProps<typeof TableWithNestedRows>> = {
    rows: exampleRowData,
    perPage: 2,
    columnOrder: [SomeColumn.A, SomeColumn.B],
    leadColumn: SomeColumn.A,
    sortingOrder: {
        column: SomeColumn.B,
        direction: OrderDirection.Asc,
    },
    getSetOrderHandler:
        ({ column, direction }) =>
        () => {
            alert(`Setting order for ${column} and ${direction}`)
        },
    columnConfig: exampleColumnConfig,
}

export const Default = { render: Template, args: defaultProps }

export default storyConfig
