import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import TableWrapper from '../TableWrapper'
import TableBody from '../TableBody'
import TableBodyRow from '../TableBodyRow'
import BodyCell from './BodyCell'

const storyConfig: Meta = {
    title: 'General/Table/Body Cell',
    component: BodyCell,
}

const Template: Story<ComponentProps<typeof BodyCell>> = (props) => (
    <TableWrapper>
        <TableBody>
            <TableBodyRow>
                {[
                    'Row body cell value 1',
                    'Row body cell value 2',
                    'Row body cell value 3',
                ].map((value, index) => (
                    <BodyCell key={index} style={{width: '33%'}} {...props}>
                        {value}
                    </BodyCell>
                ))}
            </TableBodyRow>
        </TableBody>
    </TableWrapper>
)

export const Default = Template.bind({})
Default.args = {
    className: 'test-body-cell',
    size: 'normal',
    innerClassName: 'test-inner-class-name',
}

export default storyConfig
