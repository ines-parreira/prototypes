import { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
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

    const renderComponent = (
        props?: Partial<ComponentProps<typeof ArrayExpression>>,
    ) =>
        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={appQueryClient}>
                    <ArrayExpression {...minProps} {...props} />
                </QueryClientProvider>
            </Provider>,
        )

    it('should render component and not display any error', () => {
        renderComponent({
            elements: [
                {
                    value: 'hello',
                },
                {
                    value: 'world!',
                },
            ],
        })

        expect(
            screen.queryByText('This field cannot be empty'),
        ).not.toBeInTheDocument()
    })

    it('should display an error because the field is empty', () => {
        renderComponent()

        expect(
            screen.getByText('This field cannot be empty'),
        ).toBeInTheDocument()
    })
})
