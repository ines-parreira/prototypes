import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TableBody from '../TableBody'
import TableBodyRow from '../TableBodyRow'
import TableWrapper from '../TableWrapper'
import BodyCell from './BodyCell'

const storyConfig: Meta = {
    title: 'General/Table/Body Cell',
    component: BodyCell,
}

const Template: StoryObj<typeof BodyCell> = {
    render: function Template(props) {
        return (
            <TableWrapper>
                <TableBody>
                    <TableBodyRow>
                        {[
                            'Row body cell value 1',
                            'Row body cell value 2',
                            'Row body cell value 3',
                        ].map((value, index) => (
                            <BodyCell
                                key={index}
                                style={{ width: '33%' }}
                                {...props}
                            >
                                {value}
                            </BodyCell>
                        ))}
                    </TableBodyRow>
                </TableBody>
            </TableWrapper>
        )
    },
}

export const Default = {
    ...Template,
    args: {
        className: 'test-body-cell',
        size: 'normal',
        innerClassName: 'test-inner-class-name',
    },
}

export default storyConfig
