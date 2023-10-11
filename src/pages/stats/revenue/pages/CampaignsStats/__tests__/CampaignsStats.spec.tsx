import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import _cloneDeep from 'lodash/cloneDeep'
import {render} from '@testing-library/react'
import {MemoryRouter, Route} from 'react-router-dom'
import {RootState} from 'state/types'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {mockStore} from 'utils/testing'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {integrationsStateWithShopify} from 'fixtures/integrations'
import {HelpdeskPrice} from 'models/billing/types'
import {
    basicMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    products,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import ConvertCampaignsStats from '../CampaignsStats'
import CampaignStatsPaywallView from '../CampaignStatsPaywallView'

jest.mock('../../../containers/RevenueStatsContent', () => ({
    RevenueStatsContent: () => {
        return <div>ConvertStatsContent</div>
    },
}))

jest.mock('../../../containers/RevenueFilters', () => ({
    RevenueFilters: () => {
        return <div>Filters</div>
    },
}))

describe('CampaignsStats', () => {
    const getState = (price: HelpdeskPrice = basicMonthlyHelpdeskPrice) => {
        const productsWithStarter = _cloneDeep(products)
        productsWithStarter[0].prices.push(price)

        return {
            integrations: fromJS(integrationsStateWithShopify),
            billing: fromJS({...billingState, products: productsWithStarter}),
            stats: fromJS({
                filters: {},
            }),
            currentAccount: fromJS({
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]: price.price_id,
                    },
                },
            }),
        }
    }

    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        render(
            <MemoryRouter>
                <Provider store={mockStore(state as any)}>
                    <Route path="/app/stats/revenue/campaigns">
                        <CampaignStatsPaywallView />
                    </Route>
                    <ConvertCampaignsStats {...props} />
                </Provider>
            </MemoryRouter>
        )

    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
    })

    describe('when on Starter plan', () => {
        const mockedState = getState(starterHelpdeskPrice)

        it('should render the default paywall', () => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
            ).mockImplementation(() => false)

            const {getByText} = renderWithStore(mockedState)

            expect(getByText('Track chat campaigns')).toBeInTheDocument()
            expect(getByText('Upgrade to Convert')).toBeInTheDocument()
        })
    })

    describe('when not on Starter plan', () => {
        const mockedState = getState()

        it('should render the paywall with modal for Convert non-subscriber', () => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
            ).mockImplementation(() => false)

            const {queryByText} = renderWithStore(mockedState)

            expect(queryByText('ConvertStatsContent')).not.toBeInTheDocument()
        })

        it('should render stats for Convert subscriber', () => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber'
            ).mockImplementation(() => true)

            const {getByText} = renderWithStore(mockedState)

            expect(getByText('ConvertStatsContent')).toBeInTheDocument()
        })
    })
})
