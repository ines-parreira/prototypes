import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import {OrderDirection} from 'models/api/types'

import TableHead from '../TableHead'
import TableWrapper from '../TableWrapper'
import HeaderCell from './HeaderCell'
import HeaderCellProperty from './HeaderCellProperty'

const storyConfig: Meta = {
    title: 'General/Table/Header Cell',
    component: HeaderCell,
}

const HeaderCellTemplate: Story<ComponentProps<typeof HeaderCell>> = (
    props
) => (
    <TableWrapper>
        <TableHead>
            {['Column 1', 'Column 2', 'Column 3'].map((value, index) => (
                <HeaderCell key={index} style={{width: '33%'}} {...props}>
                    {value}
                </HeaderCell>
            ))}
        </TableHead>
    </TableWrapper>
)
const HeaderCellPropertyTemplate: Story<
    ComponentProps<typeof HeaderCellProperty>
> = (props) => (
    <TableWrapper>
        <TableHead>
            <HeaderCellProperty {...props} />
        </TableHead>
    </TableWrapper>
)

export const Default = HeaderCellTemplate.bind({})
Default.args = {
    className: 'test-cell',
    size: 'normal',
}

export const WithProperty = HeaderCellPropertyTemplate.bind({})
WithProperty.args = {
    className: 'test-cell',
    title: 'Column title example',
    direction: OrderDirection.Asc,
    isOrderedBy: true,
    tooltip: 'Test tooltip data',
}

export default storyConfig
