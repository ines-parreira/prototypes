import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {OrderDirection} from 'models/api/types'
import HeaderCell from './cells/HeaderCell'
import HeaderCellProperty from './cells/HeaderCellProperty'
import BodyCell from './cells/BodyCell'
import TableWrapper from './TableWrapper'
import TableHead from './TableHead'
import TableBody from './TableBody'
import TableBodyRow from './TableBodyRow'

const tableColumns = [
    {
        key: 'col1',
        title: 'column 1',
    },
    {
        key: 'col2',
        title: 'column 2',
    },
    {
        key: 'col3',
        title: 'column 3',
    },
    {
        key: 'col4',
        title: 'column 4',
    },
]

const storyConfig: Meta = {
    title: 'General/Table/Example',
    component: TableWrapper,
}

const SimpleTable: Story<ComponentProps<typeof TableWrapper>> = (props) => (
    <TableWrapper {...props}>
        <TableHead>
            {tableColumns.map((column) => (
                <HeaderCell key={column.key} style={{width: '25%'}}>
                    {column.title}
                </HeaderCell>
            ))}
        </TableHead>
        <TableBody>
            {tableColumns.map((_, index) => (
                <TableBodyRow key={index}>
                    {tableColumns.map((_, index) => (
                        <BodyCell key={index}>Lorem ipsum dolor sit.</BodyCell>
                    ))}
                </TableBodyRow>
            ))}
        </TableBody>
    </TableWrapper>
)

const HeaderCellPropertyTable: Story<ComponentProps<typeof TableWrapper>> = (
    props
) => (
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
                    style={{width: '25%'}}
                />
            ))}
        </TableHead>
        <TableBody>
            {tableColumns.map((_, index) => (
                <TableBodyRow key={index}>
                    {tableColumns.map((_, index) => (
                        <BodyCell key={index}>Lorem ipsum dolor sit.</BodyCell>
                    ))}
                </TableBodyRow>
            ))}
        </TableBody>
    </TableWrapper>
)

export const Default = SimpleTable.bind({})
export const WithProperty = HeaderCellPropertyTable.bind({})

export default storyConfig
