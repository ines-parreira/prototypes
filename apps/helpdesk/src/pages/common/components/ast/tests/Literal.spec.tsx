import { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import Literal from 'pages/common/components/ast/Literal'
import { RuleItemActions } from 'pages/settings/rules/types'
import { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const commonProps = {
    rule: fromJS({ foo: 'rule' }),
    actions: {} as RuleItemActions,
    leftsiblings: fromJS([{ foo: 'leftsiblings' }]),
    parent: fromJS(['body', 0, 'test']),
    schemas: fromJS({ foo: 'schemas' }),
    callee: { name: 'eq' },
    value: 'hey',
}

const renderComponent = (props?: Partial<ComponentProps<typeof Literal>>) =>
    render(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={appQueryClient}>
                <Literal {...commonProps} {...props} />
            </QueryClientProvider>
        </Provider>,
    )

describe('Literal component', () => {
    it('should return null because the operator is an empty operator', () => {
        const callee = { name: 'isEmpty' }

        const { container } = renderComponent({ callee })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display an error because the value is empty', () => {
        const { container } = renderComponent({ value: '' })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display an error because the value is not empty', () => {
        const { container } = renderComponent()

        expect(container.firstChild).toMatchSnapshot()
    })
})
