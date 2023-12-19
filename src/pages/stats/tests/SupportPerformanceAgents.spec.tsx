import {render, screen} from '@testing-library/react'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'
import {AgentsPerformanceCardExtra} from 'pages/stats/AgentsPerformanceCardExtra'
import AgentsShoutouts from 'pages/stats/AgentsShoutouts'
import {AgentsTable} from 'pages/stats/AgentsTable'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {assumeMock} from 'utils/testing'

import SupportPerformanceAgents, {
    AGENT_PERFORMANCE_SECTION_TITLE,
    AGENTS_PAGE_TITLE,
} from '../SupportPerformanceAgents'

jest.unmock('react-router-dom')

jest.mock('state/ui/stats/agentPerformanceSlice')
jest.mock('pages/stats/AgentsTable.tsx')
const AgentsTableMock = assumeMock(AgentsTable)
jest.mock('pages/stats/SupportPerformanceFilters.tsx')
const SupportPerformanceFiltersMock = assumeMock(SupportPerformanceFilters)

jest.mock('pages/stats/AgentsPerformanceCardExtra.tsx')
const AgentsPerformanceCardExtraMock = assumeMock(AgentsPerformanceCardExtra)
jest.mock('pages/stats/AgentsShoutouts.tsx')
const AgentsShoutoutsMock = assumeMock(AgentsShoutouts)
jest.mock('pages/stats/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock('hooks/reporting/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
jest.mock('hooks/reporting/useAgentsSummaryMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
const componentMock = () => <div />

describe('SupportPerformanceAgents', () => {
    SupportPerformanceFiltersMock.mockImplementation(componentMock)
    AgentsShoutoutsMock.mockImplementation(componentMock)
    AgentsPerformanceCardExtraMock.mockImplementation(componentMock)
    AgentsTableMock.mockImplementation(componentMock)
    AnalyticsFooterMock.mockImplementation(componentMock)
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
        render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        const button = screen.getByText(/Download data/)

        expect(button).toBeInTheDocument()
    })

    it('should render the HeatmapSwitch and Agents Shoutout', () => {
        render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        expect(AgentsPerformanceCardExtraMock).toHaveBeenCalled()
        expect(AgentsShoutoutsMock).toHaveBeenCalled()
    })
})
