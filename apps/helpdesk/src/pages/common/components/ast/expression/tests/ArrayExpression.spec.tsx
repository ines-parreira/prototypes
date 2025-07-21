import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import ArrayExpression from 'pages/common/components/ast/expression/ArrayExpression'
import { RuleItemActions } from 'pages/settings/rules/types'

const mockStore = configureMockStore([thunk])

describe('<ArrayExpression />', () => {
    const minProps = {
        actions: {} as RuleItemActions,
        elements: [],
        leftsiblings: fromJS([]),
        parent: fromJS(['body', 0, 'test', 'arguments', 1]),
        rule: fromJS({}),
        schemas: fromJS({}),
    }

    it('should render component and not display any error', () => {
        const elements = [
            {
                value: 'hello',
            },
            {
                value: 'world!',
            },
        ]

        render(
            <Provider store={mockStore({})}>
                <ArrayExpression {...minProps} elements={elements} />
            </Provider>,
        )

        expect(
            screen.queryByText('This field cannot be empty'),
        ).not.toBeInTheDocument()
    })

    it('should display an error because the field is empty', () => {
        render(
            <Provider store={mockStore({})}>
                <ArrayExpression {...minProps} />
            </Provider>,
        )

        expect(
            screen.getByText('This field cannot be empty'),
        ).toBeInTheDocument()
    })
})
