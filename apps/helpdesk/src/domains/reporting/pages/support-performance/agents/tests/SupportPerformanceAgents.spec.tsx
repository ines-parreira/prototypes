import type { ComponentProps } from 'react'
import React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter, Route } from 'react-router-dom'

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
import { TableColumnsOrder } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { DownloadAgentsAvailabilityButton } from 'domains/reporting/pages/support-performance/agents/DownloadAgentsAvailabilityButton'
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
} from 'fixtures/plans'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.unmock('react-router-dom')

jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice')
jest.mock('domains/reporting/pages/support-performance/agents/AgentsTable.tsx')
const AgentTableWithDefaultStateMock = assumeMock(AgentsTableWithDefaultState)
jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentAvailabilityTable',
)
const AgentAvailabilityTableMock = assumeMock(
    require('domains/reporting/pages/support-performance/agents/AgentAvailabilityTable')
        .AgentAvailabilityTable,
)
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
    'domains/reporting/pages/support-performance/agents/DownloadAgentsAvailabilityButton',
)
const DownloadAgentsAvailabilityButtonMock = assumeMock(
    DownloadAgentsAvailabilityButton,
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
jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

const componentMock = () => <div />

const defaultState = {
    billing: fromJS(billingState),
    ui: {
        stats: {
            filters: {
                cleanStatsFilters: {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
            },
        },
    },
    stats: {
        filters: {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
        },
    },
} as RootState

describe('SupportPerformanceAgents', () => {
    AgentsPerformanceCardExtraMock.mockImplementation(componentMock)
    AgentTableWithDefaultStateMock.mockImplementation(componentMock)
    AgentAvailabilityTableMock.mockImplementation(componentMock)
    TopCsatPerformersMock.mockImplementation(componentMock)
    TopFirstResponseTimePerformersMock.mockImplementation(componentMock)
    TopResponseTimePerformersMock.mockImplementation(componentMock)
    TopClosedTicketsPerformersMock.mockImplementation(componentMock)
    DownloadAgentsPerformanceDataButtonMock.mockImplementation(componentMock)
    DownloadAgentsAvailabilityButtonMock.mockImplementation(componentMock)
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
    useFlagMock.mockReturnValue(false)

    it('should render the page title and section title', () => {
        renderWithStore(
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/performance',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
            </MemoryRouter>,
            defaultState,
        )

        expect(screen.getByText(AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(
            screen.getByText(SECTION_TITLES.AGENT_PERFORMANCE),
        ).toBeInTheDocument()
    })

    it('should render the performance export data button on performance route', () => {
        renderWithStore(
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/performance',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
            </MemoryRouter>,
            defaultState,
        )

        expect(DownloadAgentsPerformanceDataButtonMock).toHaveBeenCalled()
        expect(DownloadAgentsAvailabilityButtonMock).not.toHaveBeenCalled()
    })

    it('should render the HeatmapSwitch and Agents Shoutout', () => {
        renderWithStore(
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/performance',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
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
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/performance',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
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
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/performance',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
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
                        [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.plan_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicYearlyAutomationPlan.plan_id,
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
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/performance',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
            </MemoryRouter>,
            state,
        )

        extendedOptionalFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render availability export data button on availability route when feature flag is enabled', () => {
        useFlagMock.mockImplementation((flag: FeatureFlagKey) => {
            if (flag === FeatureFlagKey.CustomAgentUnavailableStatuses) {
                return true
            }
            return false
        })

        renderWithStore(
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/availability',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
            </MemoryRouter>,
            defaultState,
        )

        expect(DownloadAgentsAvailabilityButtonMock).toHaveBeenCalled()
        expect(DownloadAgentsPerformanceDataButtonMock).not.toHaveBeenCalled()
    })

    it('should not render availability route when feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)

        renderWithStore(
            <MemoryRouter
                initialEntries={[
                    '/stats/support-performance-agents/performance',
                ]}
            >
                <Route path="/stats/support-performance-agents">
                    <SupportPerformanceAgentsReport />
                </Route>
            </MemoryRouter>,
            defaultState,
        )

        expect(DownloadAgentsPerformanceDataButtonMock).toHaveBeenCalled()
        expect(DownloadAgentsAvailabilityButtonMock).not.toHaveBeenCalled()
    })
})
