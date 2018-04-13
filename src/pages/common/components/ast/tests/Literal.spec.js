import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import Literal from '../Literal'

const value = 'hey'
const commonProps = {
    rule: fromJS({foo: 'rule'}),
    actions: {foo: 'actions'},
    leftsiblings: {foo: 'leftsiblings'},
    parent: fromJS(['body', 0, 'test']),
    schemas: {foo: 'schemas'},
}

describe('Literal component', () => {
    it('should return null because the operator is an empty operator', () => {
        const callee = {name: 'isEmpty'}

        const component = shallow(
            <Literal
                {...commonProps}
                callee={callee}
                value={value}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display an error because the value is empty', () => {
        const callee = {name: 'eq'}

        const component = shallow(
            <Literal
                {...commonProps}
                callee={callee}
                value=""
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not display an error because the value is not empty', () => {
        const callee = {name: 'eq'}

        const component = shallow(
            <Literal
                {...commonProps}
                callee={callee}
                value={value}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
