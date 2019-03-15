import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {WrappedCallExpression} from '../CallExpression'


const commonProps = {
    rule: {foo: 'rule'},
    actions: {foo: 'actions'},
    arguments: ['a', 1],
    schemas: {foo: 'schemas'},
    depth: 0
}

describe('CallExpression component', () => {
    describe('test condition', () => {
        const callee = {
            type: 'Identifier',
            name: 'eq'
        }

        it('should not render delete widget because the expression is the only line of the test condition', () => {
            const nonHoveredComponent = shallow(
                <WrappedCallExpression
                    {...commonProps}
                    parent={fromJS(['body', 0, 'test'])}
                    callee={callee}
                />
            )

            expect(nonHoveredComponent).toMatchSnapshot()

            const hoveredComponent = shallow(
                <WrappedCallExpression
                    {...commonProps}
                    parent={fromJS(['body', 0, 'test'])}
                    callee={callee}
                />
                , {context: {hovered: true}})

            expect(hoveredComponent).toMatchSnapshot()
        })

        it('should not render delete widget because the expression is not the only line of the test condition and the ' +
            'expression is not hovered', () => {
            const component = shallow(
                <WrappedCallExpression
                    {...commonProps}
                    parent={fromJS(['body', 0, 'test', 'left'])}
                    callee={callee}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render delete widget because the expression is not the only line of the test condition and the ' +
            'expression is hovered', () => {
            const component = shallow(
                <WrappedCallExpression
                    {...commonProps}
                    parent={fromJS(['body', 0, 'test', 'left'])}
                    callee={callee}
                />
                , {context: {hovered: true}})

            expect(component).toMatchSnapshot()
        })
    })

    describe('Action call', () => {
        const callee = {
            type: 'Identifier',
            name: 'Action'
        }

        it('should render', () => {
            const component = shallow(
                <WrappedCallExpression
                    {...commonProps}
                    parent={fromJS(['body', 0, 'expression'])}
                    callee={callee}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
