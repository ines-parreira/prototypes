import React from 'react'

import { render } from '@testing-library/react'

import { useNewAutomateFilters } from 'hooks/reporting/automate/useNewAutomateFilters'
import { useTimeSavedByAgentsTrend } from 'hooks/reporting/automate/useTimeSavedByAgentsTrend'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { TimeSavedByAgentsMetric } from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'
import { TimeSavedByAgentsKPIChart } from 'pages/stats/automate/overview/charts/TimeSavedByAgentsKPIChart'
import { assumeMock } from 'utils/testing'

jest.mock('pages/automate/automate-metrics/TimeSavedByAgentsMetric')
const TimeSavedByAgentsMetricMock = assumeMock(TimeSavedByAgentsMetric)

jest.mock('hooks/reporting/automate/useNewAutomateFilters')
const useNewAutomateFiltersMock = assumeMock(useNewAutomateFilters)
jest.mock('hooks/reporting/automate/useTimeSavedByAgentsTrend')
const useTimeSavedByAgentsTrendMock = assumeMock(useTimeSavedByAgentsTrend)

describe('TimeSavedByAgentsKPICHart', () => {
    const statsFilters: StatsFilters = {
        period: { start_datetime: '', end_datetime: '' },
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day
    const isAnalyticsNewFiltersAutomate = true
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
            isAnalyticsNewFiltersAutomate,
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
