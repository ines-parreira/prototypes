import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { WithChildren } from 'pages/common/components/table/TableBodyRowExpandable'
import { TableBodyRowExpandable } from 'pages/common/components/table/TableBodyRowExpandable'

import BodyCell from './cells/BodyCell'
import HeaderCellProperty from './cells/HeaderCellProperty'
import TableBody from './TableBody'
import TableHead from './TableHead'
import TableWrapper from './TableWrapper'

const tableColumns = [
    {
        key: 'col1',
        title: 'Label',
    },
    {
        key: 'col2',
        title: 'Value',
    },
]

type Data = {
    label: string
    value: number
}

const sampleData: WithChildren<Data>[] = [
    {
        label: 'Level 1.1',
        value: 10,
        children: [
            {
                label: 'Level 2.1',
                value: 10,
                children: [
                    {
                        label: 'Level 3.1',
                        value: 10,
                        children: [],
                    },
                    {
                        label: 'Level 3.2',
                        value: 20,
                        children: [],
                    },
                    {
                        label: 'Level 3.3',
                        value: 30,
                        children: [],
                    },
                ],
            },
            {
                label: 'Level 2.2',
                value: 20,
                children: [
                    {
                        label: 'Level 3.4',
                        value: 10,
                        children: [],
                    },
                ],
            },
            {
                label: 'Level 2.3',
                value: 30,
                children: [],
            },
        ],
    },
    {
        label: 'Level 1.2',
        value: 20,
        children: [
            {
                label: 'Level 2.4',
                value: 30,
                children: [],
            },
        ],
    },
    {
        label: 'Level 1.3',
        value: 30,
        children: [],
    },
]

const storyConfig: Meta = {
    title: 'General/Table/ExampleWithExpandableRow',
    component: TableWrapper,
}

const CustomFieldsDataRow = (dataRow: WithChildren<Data>) => {
    return (
        <>
            <BodyCell>{dataRow.label}</BodyCell>
            <BodyCell>{dataRow.value}</BodyCell>
        </>
    )
}
type Story = StoryObj<typeof TableWrapper>

const TableWithExpandableRows: Story = {
    render: function Template() {
        return (
            <TableWrapper>
                <TableHead>
                    {tableColumns.map((column, index) => (
                        <HeaderCellProperty
                            key={column.key}
                            title={column.title}
                            colSpan={index === 0 ? 2 : undefined}
                            style={
                                index === 0
                                    ? { width: '250px', minWidth: '250px' }
                                    : {}
                            }
                        />
                    ))}

                    {/*<HeaderCellProperty title={'Value'} />*/}
                </TableHead>
                <TableBody>
                    {sampleData.map((tag, index) => (
                        <TableBodyRowExpandable<WithChildren<Data>, undefined>
                            key={index}
                            RowContentComponent={CustomFieldsDataRow}
                            rowContentProps={tag}
                            tableProps={undefined}
                        />
                    ))}
                </TableBody>
            </TableWrapper>
        )
    },
}

export const Default = TableWithExpandableRows

export default storyConfig
