import React from 'react'
import {shallow} from 'enzyme'

import IfStatement from '../IfStatement'

describe('IfStatement component', () => {
    it('should not render alternate because there is none', () => {
        const component = shallow(<IfStatement />)

        expect(component).toMatchSnapshot()
    })

    it('should render alternate because there is one', () => {
        const component = shallow(<IfStatement alternate={{foo: 'bar'}} />)

        expect(component).toMatchSnapshot()
    })
})
