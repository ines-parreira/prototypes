import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'
import {mockStore} from 'utils/testing'
import ConvertPaywallView from 'pages/convert/common/components/ConvertPaywallView/ConvertPaywallView'
import {getStateWithPrice} from 'utils/paywallTesting'

jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)

describe('ConvertPaywallView', () => {
    const defaultProps = {
        pageHeader: 'Paywall page header',
        header: 'Paywall header',
        description: 'Paywall description',
        previewImage: '/some/path/to/image.png',
        modalCanduId: 'paywall-modal-candu-id',
        onSubscribedRedirectPath: '/some/path/to/redirect',
    }

    const renderWithStore = (state: Partial<RootState>) =>
        render(
            <Provider store={mockStore(state as any)}>
                <ConvertPaywallView {...defaultProps} />
            </Provider>
        )

    it('renders correctly', () => {
        const mockedState = getStateWithPrice()

        const {getByText} = renderWithStore(mockedState)

        expect(getByText('Paywall page header')).toBeInTheDocument()
        expect(getByText('Paywall header')).toBeInTheDocument()
        expect(getByText('Paywall description')).toBeInTheDocument()
    })

    it('always has custom CTA and modal', () => {
        const mockedState = getStateWithPrice()

        const {getByText, queryByTestId} = renderWithStore(mockedState)

        expect(getByText('Get Convert')).toBeInTheDocument()
        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).toBeInTheDocument()
    })
})
