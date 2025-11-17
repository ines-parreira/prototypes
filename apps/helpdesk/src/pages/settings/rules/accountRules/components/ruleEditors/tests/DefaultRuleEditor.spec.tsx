import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import { emptyRule } from 'fixtures/rule'
import { user } from 'fixtures/users'
import type { RootState, StoreDispatch } from 'state/types'

import DefaultRuleEditor from '../DefaultRuleEditor'

describe('<DefaultRuleEditor/>', () => {
    const minProps = {
        rule: emptyRule,
        handleDelete: jest.fn(),
        handleSubmit: jest.fn(),
        handleDirtyForm: jest.fn(),
        isDeleting: false,
        isSubmitting: false,
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {},
        currentUser: fromJS(user),
    } as RootState)

    it('should render correctly', () => {
        const { container } = render(
            <Provider store={store}>
                <QueryClientProvider client={appQueryClient}>
                    <DefaultRuleEditor {...minProps} />
                </QueryClientProvider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
