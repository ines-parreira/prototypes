import React, { ComponentProps } from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { useAgentsAverageMetrics } from 'hooks/reporting/support-performance/agents/useAgentsAverageMetrics'
import { useAgentsMetrics } from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { ChartsActionMenu } from 'pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu'
import { AgentsPerformanceCardExtra } from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTableWithDefaultState } from 'pages/stats/support-performance/agents/AgentsTable'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'pages/stats/support-performance/agents/AgentsTableChart'
import { TableColumnsOrder } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { DownloadAgentsPerformanceDataButton } from 'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton'
import SupportPerformanceAgentsReport, {
    AGENTS_PAGE_TITLE,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReport'
import { AGENTS_OPTIONAL_FILTERS } from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import { TopCsatPerformers } from 'pages/stats/support-performance/agents/TopCsatPerformers'
import { TopFirstResponseTimePerformers } from 'pages/stats/support-performance/agents/TopFirstResponseTimePerformers'
import { TopResponseTimePerformers } from 'pages/stats/support-performance/agents/TopResponseTimePerformers'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

import { TopClosedTicketsPerformers } from '../TopClosedTicketsPerformers'

jest.unmock('react-router-dom')

jest.mock('state/ui/stats/agentPerformanceSlice')
jest.mock('pages/stats/support-performance/agents/AgentsTable.tsx')
const AgentTableWithDefaultStateMock = assumeMock(AgentsTableWithDefaultState)
jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock(
    'pages/stats/support-performance/agents/AgentsPerformanceCardExtra.tsx',
)
const AgentsPerformanceCardExtraMock = assumeMock(AgentsPerformanceCardExtra)
jest.mock(
    'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton',
)
const DownloadAgentsPerformanceDataButtonMock = assumeMock(
    DownloadAgentsPerformanceDataButton,
)
jest.mock('pages/stats/support-performance/agents/TopCsatPerformers')
const TopCsatPerformersMock = assumeMock(TopCsatPerformers)
jest.mock(
    'pages/stats/support-performance/agents/TopFirstResponseTimePerformers',
)
const TopFirstResponseTimePerformersMock = assumeMock(
    TopFirstResponseTimePerformers,
)
jest.mock('pages/stats/support-performance/agents/TopResponseTimePerformers')
const TopResponseTimePerformersMock = assumeMock(TopResponseTimePerformers)
jest.mock('pages/stats/support-performance/agents/TopClosedTicketsPerformers')
const TopClosedTicketsPerformersMock = assumeMock(TopClosedTicketsPerformers)
jest.mock('pages/stats/common/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock('hooks/reporting/support-performance/agents/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
jest.mock('hooks/reporting/support-performance/agents/useAgentsAverageMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsAverageMetrics)
jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

const componentMock = () => <div />

const defaultState = {
    billing: fromJS(billingState),
} as RootState

describe('SupportPerformanceAgents', () => {
    AgentsPerformanceCardExtraMock.mockImplementation(componentMock)
    AgentTableWithDefaultStateMock.mockImplementation(componentMock)
    TopCsatPerformersMock.mockImplementation(componentMock)
    TopFirstResponseTimePerformersMock.mockImplementation(componentMock)
    TopResponseTimePerformersMock.mockImplementation(componentMock)
    TopClosedTicketsPerformersMock.mockImplementation(componentMock)
    DownloadAgentsPerformanceDataButtonMock.mockImplementation(componentMock)
    AnalyticsFooterMock.mockImplementation(componentMock)
    ChartsActionMenuMock.mockImplementation(componentMock)
    useAgentsMetricsMock.mockReturnValue({
        reportData: {
            closedTicketsMetric: {
                isFetching: false,
                isError: false,
                data: { allData: [], value: null },
            },
        },
    } as any)
    useAgentsSummaryMetricsMock.mockReturnValue({
        summaryData: {
            closedTicketsMetric: {
                isFetching: false,
                isError: false,
                data: { value: 2 },
            },
        },
    } as any)
    useAgentsTableConfigSettingMock.mockReturnValue({
        columnsOrder: TableColumnsOrder,
    } as any)

    it('should render the page title and section title', () => {
        renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState,
        )

        expect(screen.getByText(AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(
            screen.getByText(AGENT_PERFORMANCE_SECTION_TITLE),
        ).toBeInTheDocument()
    })

    it('should render the export data button', () => {
        renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState,
        )

        expect(DownloadAgentsPerformanceDataButtonMock).toHaveBeenCalled()
    })

    it('should render the HeatmapSwitch and Agents Shoutout', () => {
        renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState,
        )

        expect(AgentsPerformanceCardExtraMock).toHaveBeenCalled()
        expect(TopCsatPerformersMock).toHaveBeenCalled()
        expect(TopFirstResponseTimePerformersMock).toHaveBeenCalled()
        expect(TopResponseTimePerformersMock).toHaveBeenCalled()
        expect(TopClosedTicketsPerformersMock).toHaveBeenCalled()
    })

    it('should render FiltersPanel', () => {
        const { getByText } = renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState,
        )

        AGENTS_OPTIONAL_FILTERS.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
        expect(useCleanStatsFiltersMock).toHaveBeenCalled()
    })

    it('should render FiltersPanel and score filter should be present in the FiltersPanel', () => {
        const extendedOptionalFilters = [...AGENTS_OPTIONAL_FILTERS]

        const { getByText } = renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState,
        )

        extendedOptionalFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render FiltersPanel and resolution completeness and communication skills filters should be present in the FiltersPanel', () => {
        const state = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.price_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicYearlyAutomationPlan.price_id,
                    },
                    status: 'active',
                },
            }),
        } as RootState
        const extendedOptionalFilters = [
            ...AGENTS_OPTIONAL_FILTERS,
            ...AUTO_QA_FILTER_KEYS,
        ]

        const { getByText } = renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            state,
        )

        extendedOptionalFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })
})
