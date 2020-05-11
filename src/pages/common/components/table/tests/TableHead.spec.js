//@flow
import {shallow} from 'enzyme'
import React from 'react'

import TableHead from '../TableHead'

describe('<TableHead/>', () => {
    it('should render', () => {
        const component = shallow(
            <TableHead className="foo">
                Foo
            </TableHead>
        )

        expect(component).toMatchSnapshot()
    })
})
