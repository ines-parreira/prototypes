import React from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import type { RootState } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'
import { mockStore } from 'utils/testing'

import ClickTrackingPaywallView from '../index'

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({}),
}))

describe('ClickTrackingPaywallView', () => {
    const renderWithStore = (state: Partial<RootState>) =>
        render(
            <Provider store={mockStore(state as any)}>
                <ClickTrackingPaywallView />
            </Provider>,
        )

    it('renders correctly', () => {
        const mockedState = getStateWithHelpdeskPlan()

        const { getByText } = renderWithStore(mockedState)

        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
            ),
        ).toBeInTheDocument()
    })
})
