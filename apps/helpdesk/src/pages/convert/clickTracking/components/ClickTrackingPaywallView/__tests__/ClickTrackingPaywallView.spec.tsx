import React from 'react'

import { render } from '@repo/testing'

import type { RootState } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'

import ClickTrackingPaywallView from '../ClickTrackingPaywallView'

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
        render(<ClickTrackingPaywallView />, { storeState: state })

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
