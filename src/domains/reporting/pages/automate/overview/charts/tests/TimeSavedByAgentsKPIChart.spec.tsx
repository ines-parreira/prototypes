import React from 'react'

import { render } from '@testing-library/react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { TimeSavedByAgentsKPIChart } from 'domains/reporting/pages/automate/overview/charts/TimeSavedByAgentsKPIChart'
import { TimeSavedByAgentsMetric } from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'
import { assumeMock } from 'utils/testing'

jest.mock('pages/automate/automate-metrics/TimeSavedByAgentsMetric')
const TimeSavedByAgentsMetricMock = assumeMock(TimeSavedByAgentsMetric)

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useNewAutomateFiltersMock = assumeMock(useAutomateFilters)
jest.mock('domains/reporting/hooks/automate/useTimeSavedByAgentsTrend')
const useTimeSavedByAgentsTrendMock = assumeMock(useTimeSavedByAgentsTrend)

describe('TimeSavedByAgentsKPICHart', () => {
    const statsFilters: StatsFilters = {
        period: { start_datetime: '', end_datetime: '' },
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day
    const trendData = {
        value: 1,
        prevValue: 2,
    }
    const trendResponse = {
        data: trendData,
        isFetching: false,
        isError: false,
    }
    beforeEach(() => {
        useNewAutomateFiltersMock.mockReturnValue({
            statsFilters,
            userTimezone,
            granularity,
        })
        useTimeSavedByAgentsTrendMock.mockReturnValue(trendResponse)
        TimeSavedByAgentsMetricMock.mockImplementation(() => <div />)
    })
    it('should pass data to TimeSavedByAgentsMetric', () => {
        render(<TimeSavedByAgentsKPIChart />)

        expect(TimeSavedByAgentsMetricMock).toHaveBeenCalledWith(
            {
                timeSavedByAgentsTrend: trendResponse,
            },
            {},
        )
    })
})
