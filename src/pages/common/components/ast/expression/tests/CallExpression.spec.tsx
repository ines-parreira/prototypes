import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import CallExpression from 'pages/common/components/ast/expression/CallExpression'
import Expression from 'pages/common/components/ast/expression/Expression'
import Statement from 'pages/common/components/ast/statements/Statement'
import {RuleContext} from 'pages/common/hooks/rule/RuleProvider'
import {RuleItemActions} from 'pages/settings/rules/types'
import {ObjectExpressionPropertyKey} from 'state/rules/types'
import {renderWithStore} from 'utils/testing'

jest.mock(
    'pages/common/components/ast/operations/DeleteBinaryExpression',
    () => () => <div>DeleteBinaryExpressionMock</div>
)

const commonProps = {
    rule: fromJS({foo: 'rule'}),
    actions: {} as RuleItemActions,
    arguments: ['a', {properties: []}],
    schemas: fromJS({foo: 'schemas'}),
    depth: 0,
}

describe('<CallExpression />', () => {
    describe('Expression is a condition', () => {
        const callee: ObjectExpressionPropertyKey = {
            type: 'Identifier',
            name: 'eq',
        }

        it('should not render `delete` icon because the expression is the only line of the test condition', () => {
            const {container} = renderWithStore(
                <RuleContext.Provider value={{Expression, Statement}}>
                    <CallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'test'])}
                        callee={callee}
                    />
                </RuleContext.Provider>,
                {}
            )
            fireEvent.mouseEnter(container.firstChild!)

            expect(
                screen.queryByText('DeleteBinaryExpressionMock')
            ).not.toBeInTheDocument()
        })

        it(
            'should render `delete` icon because the expression is not the only line of the test condition and the ' +
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
                expect(
                    screen.queryByText('DeleteBinaryExpressionMock')
                ).not.toBeInTheDocument()

                fireEvent.mouseEnter(container.firstChild!)

                expect(
                    screen.getByText('DeleteBinaryExpressionMock')
                ).toBeInTheDocument()
            }
        )
    })

    describe('Expression is an action', () => {
        const callee: ObjectExpressionPropertyKey = {
            type: 'Identifier',
            name: 'Action',
        }

        it('should render action select', () => {
            render(
                <RuleContext.Provider value={{Expression, Statement}}>
                    <CallExpression
                        {...commonProps}
                        parent={fromJS(['body', 0, 'expression'])}
                        callee={callee}
                    />
                </RuleContext.Provider>
            )

            expect(screen.getByText('Select action')).toBeInTheDocument()
        })
    })
})
