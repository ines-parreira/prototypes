import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { OrderDirection } from 'models/api/types'

import TableHead from '../TableHead'
import TableWrapper from '../TableWrapper'
import HeaderCell from './HeaderCell'
import HeaderCellProperty from './HeaderCellProperty'

const storyConfig: Meta = {
    title: 'General/Table/Header Cell',
    component: HeaderCell,
}

type Story = StoryObj<typeof HeaderCellProperty>

const HeaderCellTemplate: Story = {
    render: function Template(props) {
        return (
            <TableWrapper>
                <TableHead>
                    {['Column 1', 'Column 2', 'Column 3'].map(
                        (value, index) => (
                            <HeaderCell
                                key={index}
                                style={{ width: '33%' }}
                                {...props}
                            >
                                {value}
                            </HeaderCell>
                        ),
                    )}
                </TableHead>
            </TableWrapper>
        )
    },
}

const HeaderCellPropertyTemplate: StoryObj<
    ComponentProps<typeof HeaderCellProperty>
> = {
    render: function Template(props) {
        return (
            <TableWrapper>
                <TableHead>
                    <HeaderCellProperty {...props} />
                </TableHead>
            </TableWrapper>
        )
    },
}

export const Default = {
    ...HeaderCellTemplate,
    args: {
        className: 'test-cell',
        size: 'normal',
    },
}

export const WithProperty = {
    ...HeaderCellPropertyTemplate,
    args: {
        className: 'test-cell',
        title: 'Column title example',
        direction: OrderDirection.Asc,
        isOrderedBy: true,
        tooltip: 'Test tooltip data',
    },
}

export default storyConfig
