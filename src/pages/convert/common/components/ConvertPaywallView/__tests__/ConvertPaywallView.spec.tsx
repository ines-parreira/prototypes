import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {RootState} from 'state/types'
import {mockStore} from 'utils/testing'
import {getStateWithPrice} from 'utils/paywallTesting'
import {ConvertFeatures} from '../constants'
import ConvertPaywallView from '../ConvertPaywallView'

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

describe('ConvertPaywallView', () => {
    const renderWithStore = (state: Partial<RootState>) =>
        render(
            <Provider store={mockStore(state as any)}>
                <ConvertPaywallView
                    convertFeature={ConvertFeatures.Default}
                    modalCanduId={'click-tracking-paywall-modal'}
                    onSubscribedRedirectPath={
                        '/app/settings/convert/click-tracking'
                    }
                />
            </Provider>
        )

    it('renders correctly', () => {
        const mockedState = getStateWithPrice()

        const {getByText} = renderWithStore(mockedState)

        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩'
            )
        ).toBeInTheDocument()
        expect(
            getByText('Transform visitors into loyal customers.')
        ).toBeInTheDocument()
    })

    it('always has custom CTA and modal', () => {
        const mockedState = getStateWithPrice()

        const {getByText, queryByTestId} = renderWithStore(mockedState)

        expect(getByText('Select plan to get started')).toBeInTheDocument()
        const mockModal = queryByTestId('mock-convert-subscription-modal')
        expect(mockModal).toBeInTheDocument()
    })
})
