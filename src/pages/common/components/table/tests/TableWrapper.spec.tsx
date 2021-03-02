import {shallow} from 'enzyme'
import React from 'react'

import TableWrapper from '../TableWrapper'

describe('<TableWrapper/>', () => {
    it('should render', () => {
        const component = shallow(
            <TableWrapper className="foo">Bar</TableWrapper>
        )

        expect(component).toMatchSnapshot()
    })
})
