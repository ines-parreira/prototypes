import React from 'react'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import {MemoryRouter, Route} from 'react-router-dom'
import {RootState} from 'state/types'
import {mockStore} from 'utils/testing'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {starterHelpdeskPrice} from 'fixtures/productPrices'
import {getStateWithPrice} from 'utils/paywallTesting'
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
        const mockedState = getStateWithPrice(starterHelpdeskPrice)

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
        const mockedState = getStateWithPrice()

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
