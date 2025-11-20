import { render, screen } from '@testing-library/react'

import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { AnalyticsOverviewCostSavedCard } from './AnalyticsOverviewCostSavedCard'

jest.mock('pages/aiAgent/Overview/hooks/useCurrency')

describe('AnalyticsOverviewCostSavedCard', () => {
    beforeEach(() => {
        ;(useCurrency as jest.Mock).mockReturnValue({
            currency: 'USD',
            isCurrencyUSD: true,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the card title', () => {
        render(<AnalyticsOverviewCostSavedCard />)

        expect(screen.getByText('Cost saved')).toBeInTheDocument()
    })

    it('should format and display currency correctly', () => {
        render(<AnalyticsOverviewCostSavedCard />)

        expect(screen.getByText('$2,400')).toBeInTheDocument()
    })
})
