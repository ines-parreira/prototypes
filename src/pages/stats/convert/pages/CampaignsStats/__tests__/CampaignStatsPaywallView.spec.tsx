import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'
import {mockStore} from 'utils/testing'
import {getStateWithPrice} from 'utils/paywallTesting'
import CampaignStatsPaywallView from '../CampaignStatsPaywallView'

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

jest.mock('react-router-dom', () => ({
    useParams: jest.fn().mockReturnValue({}),
}))

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

        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩'
            )
        ).toBeInTheDocument()
        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).toBeInTheDocument()
    })
})
