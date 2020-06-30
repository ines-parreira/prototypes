//@flow
import {shallow} from 'enzyme'
import React from 'react'

import TableBody from '../TableBody'

describe('<TableBody/>', () => {
    it('should render', () => {
        const component = shallow(<TableBody className="foo">Foo</TableBody>)

        expect(component).toMatchSnapshot()
    })
})
