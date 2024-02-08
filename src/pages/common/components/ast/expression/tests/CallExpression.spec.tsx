import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {RuleContext} from 'pages/common/hooks/rule/RuleProvider'
import WrappedCallExpression from '../CallExpression'
import {ObjectExpressionPropertyKey} from '../../../../../../state/rules/types'
import {RuleItemActions} from '../../../../../settings/rules/types'
import Expression from '../Expression'
import Statement from '../../statements/Statement'

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
                <RuleContext.Provider value={{Expression, Statement}}>
                    <WrappedCallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'test'])}
                        callee={callee}
                    />
                </RuleContext.Provider>
            )

            expect(nonHoveredComponent).toMatchSnapshot()

            const hoveredComponent = shallow(
                <RuleContext.Provider value={{Expression, Statement}}>
                    <WrappedCallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'test'])}
                        callee={callee}
                    />
                </RuleContext.Provider>
            )

            expect(hoveredComponent).toMatchSnapshot()
        })

        it(
            'should not render delete widget because the expression is not the only line of the test condition and the ' +
                'expression is not hovered',
            () => {
                const component = shallow(
                    <RuleContext.Provider value={{Expression, Statement}}>
                        <WrappedCallExpression
                            {...commonProps}
                            parent={fromJS(['body', 0, 'test', 'left'])}
                            callee={callee}
                        />
                    </RuleContext.Provider>
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render delete widget because the expression is not the only line of the test condition and the ' +
                'expression is hovered',
            () => {
                const component = shallow(
                    <RuleContext.Provider value={{Expression, Statement}}>
                        <WrappedCallExpression
                            {...commonProps}
                            parent={fromJS(['body', 0, 'test', 'left'])}
                            callee={callee}
                        />
                    </RuleContext.Provider>
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
                <RuleContext.Provider value={{Expression, Statement}}>
                    <WrappedCallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'expression'])}
                        callee={callee}
                    />
                </RuleContext.Provider>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
