import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {WrappedCallExpression} from '../CallExpression'
import {ObjectExpressionPropertyKey} from '../../../../../../state/rules/types'
import {RuleItemActions} from '../../../../../settings/rules/detail/components/RuleItem/RuleItem'

const commonProps = {
    rule: fromJS({foo: 'rule'}),
    actions: {} as RuleItemActions,
    arguments: ['a', 1],
    schemas: fromJS({foo: 'schemas'}),
    depth: 0,
}

describe('CallExpression component', () => {
    describe('test condition', () => {
        const callee: ObjectExpressionPropertyKey = {
            type: 'Identifier',
            name: 'eq',
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
                />,
                {context: {hovered: true}}
            )

            expect(hoveredComponent).toMatchSnapshot()
        })

        it(
            'should not render delete widget because the expression is not the only line of the test condition and the ' +
                'expression is not hovered',
            () => {
                const component = shallow(
                    <WrappedCallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'test', 'left'])}
                        callee={callee}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render delete widget because the expression is not the only line of the test condition and the ' +
                'expression is hovered',
            () => {
                const component = shallow(
                    <WrappedCallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'test', 'left'])}
                        callee={callee}
                    />,
                    {context: {hovered: true}}
                )

                expect(component).toMatchSnapshot()
            }
        )
    })

    describe('Action call', () => {
        const callee: ObjectExpressionPropertyKey = {
            type: 'Identifier',
            name: 'Action',
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
