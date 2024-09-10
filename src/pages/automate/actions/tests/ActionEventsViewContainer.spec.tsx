import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'

import {billingState} from 'fixtures/billing'
import {shopifyIntegration} from 'fixtures/integrations'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {renderWithRouter} from 'utils/testing'
import ActionEventsViewContainer from '../ActionEventsViewContainer'

const mockStore = configureMockStore([thunk])

const queryClient = mockQueryClient()

describe('ActionEventsViewContainer', () => {
    it('redirect if has no automate subscription', () => {
        const defaultStore = mockStore({
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {},
                },
            }),
            billing: fromJS(billingState),
            integrations: fromJS([shopifyIntegration]),
        })

        const component = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>
        )
        expect(component.container.innerHTML).toEqual('')
    })
    it('renders without error', () => {
        const defaultStore = mockStore({
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: automationSubscriptionProductPrices,
                },
            }),
            billing: fromJS(billingState),
            integrations: fromJS([shopifyIntegration]),
        })

        const component = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>
        )

        expect(component.getByText('AI Agent')).toBeInTheDocument()
    })
})
