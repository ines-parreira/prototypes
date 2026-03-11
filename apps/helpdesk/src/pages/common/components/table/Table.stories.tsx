import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import GaugeAddon from 'domains/reporting/pages/common/components/charts/GaugeAddon'
import { DistributionCategoryCell } from 'domains/reporting/pages/ticket-insights/components/DistributionCategoryCell'
import { OrderDirection } from 'models/api/types'

import BodyCell from './cells/BodyCell'
import HeaderCell from './cells/HeaderCell'
import HeaderCellProperty from './cells/HeaderCellProperty'
import TableBody from './TableBody'
import TableBodyRow from './TableBodyRow'
import TableHead from './TableHead'
import TableWrapper from './TableWrapper'

const tableColumns = [
    {
        key: 'col1',
        title: 'column 1',
        progress: 10,
    },
    {
        key: 'col2',
        title: 'column 2',
        progress: 43,
    },
    {
        key: 'col3',
        title: 'column 3',
        progress: 100,
    },
    {
        key: 'col4',
        title: 'column 4',
        progress: 50,
    },
]

const storyConfig: Meta = {
    title: 'General/Table/Example',
    component: TableWrapper,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const SimpleTable: StoryObj<typeof TableWrapper> = {
    render: function Template(props) {
        return (
            <TableWrapper {...props}>
                <TableHead>
                    {tableColumns.map((column) => (
                        <HeaderCell key={column.key} style={{ width: '25%' }}>
                            {column.title}
                        </HeaderCell>
                    ))}
                </TableHead>
                <TableBody>
                    {tableColumns.map((_, index) => (
                        <TableBodyRow key={index}>
                            {tableColumns.map((_, index) => (
                                <BodyCell key={index}>
                                    Lorem ipsum dolor sit.
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
        )
    },
}

const HeaderCellPropertyTable: StoryObj<typeof TableWrapper> = {
    render: function Template(props) {
        return (
            <TableWrapper {...props}>
                <TableHead>
                    {tableColumns.map((column, index) => (
                        <HeaderCellProperty
                            key={column.key}
                            title={column.title}
                            direction={
                                index % 2 === 0
                                    ? OrderDirection.Asc
                                    : OrderDirection.Desc
                            }
                            isOrderedBy
                            tooltip="Test tooltip data"
                            style={{ width: '25%' }}
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {tableColumns.map((_, index) => (
                        <TableBodyRow key={index}>
                            {tableColumns.map((_, index) => (
                                <BodyCell key={index}>
                                    Lorem ipsum dolor sit.
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
        )
    },
}

const TableWithGauges: StoryObj<typeof TableWrapper> = {
    render: function Template(props) {
        return (
            <TableWrapper {...props}>
                <TableHead>
                    {tableColumns.map((column) => (
                        <HeaderCell key={column.key} style={{ width: '25%' }}>
                            {column.title}
                        </HeaderCell>
                    ))}
                </TableHead>
                <TableBody>
                    {Array.from({ length: 10 }, (_, rowIndex) => (
                        <TableBodyRow key={rowIndex}>
                            {tableColumns.map((item, index) => (
                                <BodyCell key={index}>
                                    <GaugeAddon
                                        progress={item.progress}
                                        color="#EAF1FF"
                                    >
                                        {item.progress}% Lorem ipsum dolor sit.
                                    </GaugeAddon>
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                    ))}
                    <TableBodyRow>
                        <DistributionCategoryCell
                            category="Lorem ipsum dolor dolor sit, lorem ipsum dolor dolor sit."
                            progress={25}
                        >
                            <BodyCell key="summary-first">
                                Lorem ipsum dolor dolor sit, lorem ipsum dolor
                                dolor sit.
                            </BodyCell>
                        </DistributionCategoryCell>
                        <DistributionCategoryCell
                            category="Lorem ipsum dolor dolor sit."
                            progress={0}
                        >
                            <BodyCell key="summary-second">
                                Lorem ipsum dolor dolor sit.
                            </BodyCell>
                        </DistributionCategoryCell>
                        <BodyCell key="summary-third">
                            Lorem ipsum dolor dolor sit.
                        </BodyCell>
                        <BodyCell key="summary-fourth">
                            Lorem ipsum dolor dolor sit.
                        </BodyCell>
                    </TableBodyRow>
                </TableBody>
            </TableWrapper>
        )
    },
}

export const Default = SimpleTable
export const WithProperty = HeaderCellPropertyTable
export const WithGauges = TableWithGauges

export default storyConfig
