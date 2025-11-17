import type { ComponentProps } from 'react'
import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { useAgentsAverageMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsAverageMetrics'
import { useAgentsMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsMetrics'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import type FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { AgentsPerformanceCardExtra } from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTableWithDefaultState } from 'domains/reporting/pages/support-performance/agents/AgentsTable'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'domains/reporting/pages/support-performance/agents/AgentsTableChart'
import { TableColumnsOrder } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { DownloadAgentsPerformanceDataButton } from 'domains/reporting/pages/support-performance/agents/DownloadAgentsPerformanceDataButton'
import SupportPerformanceAgentsReport, {
    AGENTS_PAGE_TITLE,
} from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReport'
import { AGENTS_OPTIONAL_FILTERS } from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import { TopClosedTicketsPerformers } from 'domains/reporting/pages/support-performance/agents/TopClosedTicketsPerformers'
import { TopCsatPerformers } from 'domains/reporting/pages/support-performance/agents/TopCsatPerformers'
import { TopFirstResponseTimePerformers } from 'domains/reporting/pages/support-performance/agents/TopFirstResponseTimePerformers'
import { TopResponseTimePerformers } from 'domains/reporting/pages/support-performance/agents/TopResponseTimePerformers'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.unmock('react-router-dom')

jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice')
jest.mock('domains/reporting/pages/support-performance/agents/AgentsTable.tsx')
const AgentTableWithDefaultStateMock = assumeMock(AgentsTableWithDefaultState)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra.tsx',
)
const AgentsPerformanceCardExtraMock = assumeMock(AgentsPerformanceCardExtra)
jest.mock(
    'domains/reporting/pages/support-performance/agents/DownloadAgentsPerformanceDataButton',
)
const DownloadAgentsPerformanceDataButtonMock = assumeMock(
    DownloadAgentsPerformanceDataButton,
)
jest.mock(
    'domains/reporting/pages/support-performance/agents/TopCsatPerformers',
)
const TopCsatPerformersMock = assumeMock(TopCsatPerformers)
jest.mock(
    'domains/reporting/pages/support-performance/agents/TopFirstResponseTimePerformers',
)
const TopFirstResponseTimePerformersMock = assumeMock(
    TopFirstResponseTimePerformers,
)
jest.mock(
    'domains/reporting/pages/support-performance/agents/TopResponseTimePerformers',
)
const TopResponseTimePerformersMock = assumeMock(TopResponseTimePerformers)
jest.mock(
    'domains/reporting/pages/support-performance/agents/TopClosedTicketsPerformers',
)
const TopClosedTicketsPerformersMock = assumeMock(TopClosedTicketsPerformers)
jest.mock('domains/reporting/pages/common/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock('domains/reporting/hooks/support-performance/agents/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
jest.mock(
    'domains/reporting/hooks/support-performance/agents/useAgentsAverageMetrics',
)
const useAgentsSummaryMetricsMock = assumeMock(useAgentsAverageMetrics)
jest.mock('domains/reporting/hooks/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock('domains/reporting/hooks/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)
jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

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
    useAiAgentAccessMock.mockReturnValue({
        hasAccess: false,
        isLoading: false,
    })

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
