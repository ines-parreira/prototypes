import React from 'react'
import {shallow, mount} from 'enzyme'

import Errors from '../Errors'

describe('Errors', () => {
    it('should use default props', () => {
        const component = mount(<Errors />)
        expect(component.find('Errors').props()).toMatchSnapshot()
    })

    it('render children', () => {
        const component = shallow(<Errors>text</Errors>)
        expect(component).toMatchSnapshot()
    })

    it('custom tag', () => {
        const component = shallow(<Errors tag="div">text</Errors>)
        expect(component).toMatchSnapshot()
    })
})
