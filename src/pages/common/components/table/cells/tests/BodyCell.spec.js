//@flow
import {shallow} from 'enzyme'
import React from 'react'

import BodyCell from '../BodyCell'

describe('<BodyCell/>', () => {
    it('should render', () => {
        const component = shallow(<BodyCell className="foo">Foo</BodyCell>)

        expect(component).toMatchSnapshot()
    })
})
