import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import _cloneDeep from 'lodash/cloneDeep'
import {account} from 'fixtures/account'
import {RootState} from 'state/types'
import {mockStore} from 'utils/testing'
import {
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    products,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import {HelpdeskPrice} from 'models/billing/types'
import {billingState} from 'fixtures/billing'
import CampaignStatsPaywallView from '../CampaignStatsPaywallView'

jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)

describe('CampaignStatsPaywallView', () => {
    const getState = (price: HelpdeskPrice = basicMonthlyHelpdeskPrice) => {
        const productsWithStarter = _cloneDeep(products)
        productsWithStarter[0].prices.push(price)

        return {
            billing: fromJS({...billingState, products: productsWithStarter}),
            currentAccount: fromJS({
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: price.price_id,
                    },
                },
            }),
        } as RootState
    }

    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        render(
            <Provider store={mockStore(state as any)}>
                <CampaignStatsPaywallView {...props} />
            </Provider>
        )

    it('has custom CTA and modal when not Starter plan', () => {
        const mockedState = getState()

        const {getByText, queryByTestId} = renderWithStore(mockedState)

        expect(getByText('Get Convert')).toBeInTheDocument()
        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).toBeInTheDocument()
    })

    it('has default CTA when on Starter plan', () => {
        const mockedState = getState(starterHelpdeskPrice)

        const {getByText, queryByTestId, queryByText} =
            renderWithStore(mockedState)

        expect(getByText('Upgrade to Convert')).toBeInTheDocument()
        expect(queryByText('Get Convert')).not.toBeInTheDocument()
        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).not.toBeInTheDocument()
    })
})
