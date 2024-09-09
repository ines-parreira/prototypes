import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {RuleContext} from 'pages/common/hooks/rule/RuleProvider'
import {ObjectExpressionPropertyKey} from 'state/rules/types'
import {RuleItemActions} from 'pages/settings/rules/types'
import Expression from 'pages/common/components/ast/expression/Expression'
import Statement from 'pages/common/components/ast/statements/Statement'
import {renderWithStore} from 'utils/testing'
import CallExpression from 'pages/common/components/ast/expression/CallExpression'

const commonProps = {
    rule: fromJS({foo: 'rule'}),
    actions: {} as RuleItemActions,
    arguments: ['a', {properties: []}],
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
            const {container: nonHoveredContainer} = renderWithStore(
                <RuleContext.Provider value={{Expression, Statement}}>
                    <CallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'test'])}
                        callee={callee}
                    />
                </RuleContext.Provider>,
                {}
            )

            expect(nonHoveredContainer.firstChild).toMatchSnapshot()

            const {container: hoveredContainer} = renderWithStore(
                <RuleContext.Provider value={{Expression, Statement}}>
                    <CallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'test'])}
                        callee={callee}
                    />
                </RuleContext.Provider>,
                {}
            )

            expect(hoveredContainer.firstChild).toMatchSnapshot()
        })

        it(
            'should not render delete widget because the expression is not the only line of the test condition and the ' +
                'expression is not hovered',
            () => {
                const {container} = renderWithStore(
                    <RuleContext.Provider value={{Expression, Statement}}>
                        <CallExpression
                            {...commonProps}
                            parent={fromJS(['body', 0, 'test', 'left'])}
                            callee={callee}
                        />
                    </RuleContext.Provider>,
                    {}
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )

        it(
            'should render delete widget because the expression is not the only line of the test condition and the ' +
                'expression is hovered',
            () => {
                const {container} = renderWithStore(
                    <RuleContext.Provider value={{Expression, Statement}}>
                        <CallExpression
                            {...commonProps}
                            parent={fromJS(['body', 0, 'test', 'left'])}
                            callee={callee}
                        />
                    </RuleContext.Provider>,
                    {}
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })

    describe('Action call', () => {
        const callee: ObjectExpressionPropertyKey = {
            type: 'Identifier',
            name: 'Action',
        }

        it('should render', () => {
            const {container} = render(
                <RuleContext.Provider value={{Expression, Statement}}>
                    <CallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'expression'])}
                        callee={callee}
                    />
                </RuleContext.Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
