import React from 'react'
import {shallow} from 'enzyme'
import {List} from 'immutable'

import IfStatement, {ConsequentStatement} from '../IfStatement.tsx'

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

describe('<ConsequentStatement/> component', () => {
    const minProps = {
        parent: List(),
        consequent: {},
    }

    it('should render', () => {
        const component = shallow(<ConsequentStatement {...minProps} />)
        expect(component).toMatchSnapshot()
    })
})
