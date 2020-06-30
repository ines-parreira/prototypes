import React from 'react'
import {shallow} from 'enzyme'

import Errors from '../Errors'

describe('Errors component', () => {
    it('should return null if there is no errors', () => {
        const component = shallow(<Errors></Errors>)
        expect(component).toMatchSnapshot()
    })

    it('should render inline errors', () => {
        const component = shallow(<Errors inline={true}>Foo</Errors>)

        expect(component).toMatchSnapshot()
    })

    it('should render block errors', () => {
        const component = shallow(<Errors>Foo</Errors>)

        expect(component).toMatchSnapshot()
    })

    it('should render block errors with display adjustements to display it below an input', () => {
        const component = shallow(<Errors belowInput={true}>Foo</Errors>)

        expect(component).toMatchSnapshot()
    })

    it('should render using passed tag', () => {
        const component = shallow(<Errors tag="pre">Foo</Errors>)

        expect(component).toMatchSnapshot()
    })
})
