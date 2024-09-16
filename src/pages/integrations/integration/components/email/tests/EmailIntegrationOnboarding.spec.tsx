import React from 'react'
import {render} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter} from 'react-router-dom'
import createMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import EmailIntegrationOnboarding from '../EmailIntegrationOnboarding'

const mockStore = createMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const store = mockStore({})

const renderComponent = () =>
    render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <EmailIntegrationOnboarding />
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    )

describe('<EmailIntegrationOnboarding />', () => {
    it('should render', () => {
        const {container, getByText} = renderComponent()
        expect(container).toBeInTheDocument()
        expect(getByText('Connect your support email')).toBeInTheDocument()
        expect(getByText('Connect email')).toBeInTheDocument()
        expect(getByText('Forward emails to Gorgias')).toBeInTheDocument()
        expect(getByText('Verify email integration')).toBeInTheDocument
    })
})
