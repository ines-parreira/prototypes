import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {AI_AGENT, OPTIMIZE} from 'pages/aiAgent/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {mockStore, renderWithRouter} from 'utils/testing'

import {Level2IntentsContainer} from './Level2IntentsContainer'

jest.mock('pages/aiAgent/hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: jest.fn().mockReturnValue(true),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const SHOP_NAME = 'shopify-store'
const SHOP_TYPE = 'shopify'

const defaultStore = mockStore({
    currentAccount: fromJS({
        ...account,
    }),
})

const renderComponent = () =>
    renderWithRouter(
        <Provider store={defaultStore}>
            <QueryClientProvider client={mockQueryClient()}>
                <Level2IntentsContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/optimize/intentId`,
            route: `/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize/intentId`,
        }
    )

describe('Level2IntentsContainer', () => {
    describe.each([
        {flag: true, title: OPTIMIZE},
        {flag: false, title: AI_AGENT},
    ])('with feature flag conv-ai-standalone-menu = $flag', ({flag, title}) => {
        it('renders the component', () => {
            mockFlags({[FeatureFlagKey.ConvAiStandaloneMenu]: flag})

            renderComponent()

            expect(
                screen.getByText('Level2IntentsContainer')
            ).toBeInTheDocument()
            expect(screen.getByText('Back to Optimize')).toBeInTheDocument()
            expect(screen.getByText(title)).toBeInTheDocument()
        })
    })

    it('calls history.push with the correct route on BackLink click', () => {
        renderComponent()

        const backLink = screen.getByText('Back to Optimize')
        fireEvent.click(backLink)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/automation/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize`
        )
    })
})
