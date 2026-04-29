import React from 'react'

import { render } from '@repo/testing'

import CampaignStatsPaywallView from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import type { RootState } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({}),
}))

describe('CampaignStatsPaywallView', () => {
    const renderWithStore = (state: Partial<RootState>, props = {}) =>
        render(<CampaignStatsPaywallView {...props} />, { storeState: state })

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
