import { render, screen } from '@testing-library/react'

import * as automateHooks from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { AnalyticsOverviewAutomationRateCard } from './AnalyticsOverviewAutomationRateCard'

jest.mock('domains/reporting/hooks/automate/useAIAgentAutomationRateTrend')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

describe('AnalyticsOverviewAutomationRateCard', () => {
    beforeEach(() => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-06-01',
                    end_datetime: '2024-06-07',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        jest.spyOn(
            automateHooks,
            'useAIAgentAutomationRateTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 0.32,
                prevValue: 0.3,
            },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the card title', () => {
        render(<AnalyticsOverviewAutomationRateCard />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should format and display percentage correctly', () => {
        render(<AnalyticsOverviewAutomationRateCard />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render hint tooltip icon', () => {
        render(<AnalyticsOverviewAutomationRateCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
