import React from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import CampaignStatsPaywallView from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import { RootState } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'
import { mockStore } from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn().mockReturnValue({}),
}))

describe('CampaignStatsPaywallView', () => {
    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        render(
            <Provider store={mockStore(state as any)}>
                <CampaignStatsPaywallView {...props} />
            </Provider>,
        )

    it('has custom CTA and modal', () => {
        const mockedState = getStateWithHelpdeskPlan()

        const { getByText } = renderWithStore(mockedState)

        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
            ),
        ).toBeInTheDocument()
    })
})
