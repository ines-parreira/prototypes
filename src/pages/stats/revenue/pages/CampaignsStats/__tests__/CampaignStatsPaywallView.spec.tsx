import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'
import {mockStore} from 'utils/testing'
import {getStateWithPrice} from 'utils/paywallTesting'
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
    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        render(
            <Provider store={mockStore(state as any)}>
                <CampaignStatsPaywallView {...props} />
            </Provider>
        )

    it('has custom CTA and modal', () => {
        const mockedState = getStateWithPrice()

        const {getByText, queryByTestId} = renderWithStore(mockedState)

        expect(getByText('Get Convert')).toBeInTheDocument()
        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).toBeInTheDocument()
    })
})
