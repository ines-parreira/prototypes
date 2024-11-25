import {render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ComponentProps} from 'react'
import {MemoryRouter} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {AgentsPerformanceCardExtra} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import AgentsShoutouts from 'pages/stats/support-performance/agents/AgentsShoutouts'
import {AgentsTableWithDefaultState} from 'pages/stats/support-performance/agents/AgentsTable'
import {TableColumnsOrder} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import SupportPerformanceAgents, {
    AGENT_PERFORMANCE_SECTION_TITLE,
    AGENTS_OPTIONAL_FILTERS,
    AGENTS_PAGE_TITLE,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgents'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'
import {assumeMock} from 'utils/testing'

jest.unmock('react-router-dom')

jest.mock('state/ui/stats/agentPerformanceSlice')
jest.mock('pages/stats/support-performance/agents/AgentsTable.tsx')
const AgentTableWithDefaultStateMock = assumeMock(AgentsTableWithDefaultState)
jest.mock('pages/stats/support-performance/SupportPerformanceFilters.tsx')
const SupportPerformanceFiltersMock = assumeMock(SupportPerformanceFilters)
jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    }
)
jest.mock(
    'pages/stats/support-performance/agents/AgentsPerformanceCardExtra.tsx'
)
const AgentsPerformanceCardExtraMock = assumeMock(AgentsPerformanceCardExtra)
jest.mock('pages/stats/support-performance/agents/AgentsShoutouts.tsx')
const AgentsShoutoutsMock = assumeMock(AgentsShoutouts)
jest.mock('pages/stats/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock('hooks/reporting/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
jest.mock('hooks/reporting/useAgentsSummaryMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)
jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
const componentMock = () => <div />

describe('SupportPerformanceAgents', () => {
    SupportPerformanceFiltersMock.mockImplementation(componentMock)
    AgentsShoutoutsMock.mockImplementation(componentMock)
    AgentsPerformanceCardExtraMock.mockImplementation(componentMock)
    AgentTableWithDefaultStateMock.mockImplementation(componentMock)
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
    useAgentsTableConfigSettingMock.mockReturnValue({
        columnsOrder: TableColumnsOrder,
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

    it('should render New FiltersPanel and hide legacy filters', () => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: true})

        const {getByText, queryByText} = render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        expect(SupportPerformanceFiltersMock).toHaveBeenCalledWith(
            expect.objectContaining({hidden: true}),
            {}
        )
        AGENTS_OPTIONAL_FILTERS.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
        expect(queryByText(FilterKey.Score)).not.toBeInTheDocument()
    })

    it('should render New FiltersPanel and score filter should be present in the FiltersPanel', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
        })
        const extendedOptionalFilters = [
            ...AGENTS_OPTIONAL_FILTERS,
            FilterKey.Score,
        ]

        const {getByText} = render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        expect(SupportPerformanceFiltersMock).toHaveBeenCalledWith(
            expect.objectContaining({hidden: true}),
            {}
        )
        extendedOptionalFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render New FiltersPanel and resolution completeness and communication skills filters should be present in the FiltersPanel', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.AutoQAFilters]: true,
        })
        const extendedOptionalFilters = [
            ...AGENTS_OPTIONAL_FILTERS,
            FilterKey.ResolutionCompleteness,
            FilterKey.CommunicationSkills,
        ]

        const {getByText} = render(
            <MemoryRouter>
                <SupportPerformanceAgents />
            </MemoryRouter>
        )

        expect(SupportPerformanceFiltersMock).toHaveBeenCalledWith(
            expect.objectContaining({hidden: true}),
            {}
        )
        extendedOptionalFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })
})
