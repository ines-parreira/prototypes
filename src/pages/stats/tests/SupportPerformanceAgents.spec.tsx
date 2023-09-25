import {render, screen} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {AgentsTable} from 'pages/stats/AgentsTable'
import {FeatureFlagKey} from 'config/featureFlags'
import {assumeMock} from 'utils/testing'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'

import SupportPerformanceAgents, {
    AGENT_PERFORMANCE_SECTION_TITLE,
    AGENTS_PAGE_TITLE,
} from '../SupportPerformanceAgents'

jest.unmock('react-router-dom')

jest.mock('state/ui/stats/agentPerformanceSlice')
jest.mock('hooks/reporting/useAgentsMetrics')
jest.mock('hooks/reporting/useAgentsSummaryMetrics')
jest.mock('pages/stats/AgentsTable.tsx')
jest.mock('pages/stats/SupportPerformanceFilters.tsx')
const AgentsTableMock = assumeMock(AgentsTable)
const SupportPerformanceFiltersMock = assumeMock(SupportPerformanceFilters)
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)

const cellMock = () => <div />

describe('SupportPerformanceAgents', () => {
    AgentsTableMock.mockImplementation(cellMock)
    SupportPerformanceFiltersMock.mockImplementation(cellMock)

    it('should render the page title and section title', () => {
        render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        expect(screen.getByText(AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(
            screen.getByText(AGENT_PERFORMANCE_SECTION_TITLE)
        ).toBeInTheDocument()
    })

    it('should render the export data button', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsExportAgentsPerformance]: true,
        }))

        useAgentsMetricsMock.mockReturnValue({
            reportData: {
                closedTicketsMetric: {
                    isFetching: false,
                    isError: false,
                    data: {allData: [], value: null},
                },
            },
        } as any)
        useAgentsSummaryMetricsMock.mockReturnValue({
            summaryData: {
                closedTicketsMetric: {
                    isFetching: false,
                    isError: false,
                    data: {value: 2},
                },
            },
        } as any)

        render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        const button = screen.getByText(/Download data/)

        expect(button).toBeInTheDocument()
    })
})
