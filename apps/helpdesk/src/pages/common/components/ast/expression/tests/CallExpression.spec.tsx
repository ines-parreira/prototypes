import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { CallExpression } from 'pages/common/components/ast/expression/CallExpression'
import { Expression } from 'pages/common/components/ast/expression/Expression'
import { DefaultExportStatement as Statement } from 'pages/common/components/ast/statements/Statement'
import { RuleContext } from 'pages/common/hooks/rule/RuleProvider'
import type { RuleItemActions } from 'pages/settings/rules/types'

jest.mock(
    'pages/common/components/ast/operations/DeleteBinaryExpression',
    () => ({
        DeleteBinaryExpression: () => <div>DeleteBinaryExpressionMock</div>,
    }),
)

const commonProps = {
    rule: fromJS({ foo: 'rule' }),
    actions: {} as RuleItemActions,
    arguments: ['a', { properties: [] }],
    schemas: fromJS({ foo: 'schemas' }),
    depth: 0,
    callee: {
        type: 'Identifier' as const,
        name: 'eq',
    },
    parent: fromJS(['body', 0, 'test']),
}

const renderComponent = (
    props?: Partial<ComponentProps<typeof CallExpression>>,
) =>
    render(
        <RuleContext.Provider value={{ Expression, Statement }}>
            <CallExpression {...commonProps} {...props} />
        </RuleContext.Provider>,
        { storeState: { integrations: fromJS({ integrations: [] }) } },
    )

describe('<CallExpression />', () => {
    describe('Expression is a condition', () => {
        it('should not render `delete` icon because the expression is the only line of the test condition', () => {
            const { container } = renderComponent()
            fireEvent.mouseEnter(container.firstChild!)

            expect(
                screen.queryByText('DeleteBinaryExpressionMock'),
            ).not.toBeInTheDocument()
        })

        it(
            'should render `delete` icon because the expression is not the only line of the test condition and the ' +
                'expression is hovered',
            () => {
                const { container } = renderComponent({
                    parent: fromJS(['body', 0, 'test', 'left']),
                })

                expect(
                    screen.queryByText('DeleteBinaryExpressionMock'),
                ).not.toBeInTheDocument()

                fireEvent.mouseEnter(container.firstChild!)

                expect(
                    screen.getByText('DeleteBinaryExpressionMock'),
                ).toBeInTheDocument()
            },
        )
    })

    describe('Expression is an action', () => {
        it('should render action select', () => {
            renderComponent({
                parent: fromJS(['body', 0, 'expression']),
                callee: {
                    type: 'Identifier',
                    name: 'Action',
                },
            })

            expect(screen.getByText('Select action')).toBeInTheDocument()
        })
    })
})
