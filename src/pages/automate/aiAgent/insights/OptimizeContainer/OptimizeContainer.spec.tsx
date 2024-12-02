import {QueryClientProvider} from '@tanstack/react-query'
import {screen, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import {account} from 'fixtures/account'
import history from 'pages/history'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {mockStore, renderWithRouter} from 'utils/testing'

import {OptimizeContainer} from './OptimizeContainer'

jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: jest.fn().mockReturnValue(true),
}))

const defaultStore = mockStore({
    currentAccount: fromJS({
        ...account,
    }),
})
const SHOP_NAME = 'shopify-store'
const SHOP_TYPE = 'shopify'

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultStore)}>
            <QueryClientProvider client={mockQueryClient()}>
                <OptimizeContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/optimize`,
            route: `/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize`,
        }
    )

describe('OptimizeContainer', () => {
    beforeEach(() => {})

    it('renders the component', () => {
        renderComponent()

        expect(screen.getByText('OptimizeContainer')).toBeInTheDocument()
    })

    it('calls history.push with the correct route on button click', () => {
        renderComponent()

        const button = screen.getByText('Click me')
        fireEvent.click(button)

        expect(history.push).toHaveBeenCalledWith(
            `/app/automation/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize/intentId`
        )
    })
})
