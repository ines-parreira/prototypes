import React from 'react'
import {shallow} from 'enzyme'

import Errors from '../Errors'

describe('Errors', () => {
    it('render children', () => {
        const component = shallow(<Errors>text</Errors>)
        expect(component).toMatchSnapshot()
    })
})
