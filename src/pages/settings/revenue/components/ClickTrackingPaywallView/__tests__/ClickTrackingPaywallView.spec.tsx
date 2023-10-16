import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'
import {mockStore} from 'utils/testing'
import {getStateWithPrice} from 'utils/paywallTesting'
import ClickTrackingPaywallView from '..'

jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)

describe('ClickTrackingPaywallView', () => {
    const renderWithStore = (state: Partial<RootState>) =>
        render(
            <Provider store={mockStore(state as any)}>
                <ClickTrackingPaywallView />
            </Provider>
        )

    it('renders correctly', () => {
        const mockedState = getStateWithPrice()

        const {getByText} = renderWithStore(mockedState)

        expect(getByText('Track clicks on chat campaigns')).toBeInTheDocument()
    })
})
