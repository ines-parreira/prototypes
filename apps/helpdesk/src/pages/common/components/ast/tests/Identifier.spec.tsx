import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import Identifier from 'pages/common/components/ast/Identifier'
import type { RuleItemActions } from 'pages/settings/rules/types'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('../widget/useGetMetafieldByKey', () => ({
    useGetMetafieldByKey: jest.fn().mockReturnValue(null),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),
}

describe('Identifier component', () => {
    it('should render', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={appQueryClient}>
                    <Identifier
                        className="foo"
                        name="eq"
                        parent={fromJS(['body', 0, 'expression'])}
                        rule={fromJS({ foo: 'rule' })}
                        actions={{} as RuleItemActions}
                        leftsiblings={fromJS([{ foo: 'leftsiblings' }])}
                        schemas={fromJS({})}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
