import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ComponentProps} from 'react'
import {MemoryRouter} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {useAgentsMetrics} from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/support-performance/agents/useAgentsSummaryMetrics'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {AgentsPerformanceCardExtra} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import {AgentsTableWithDefaultState} from 'pages/stats/support-performance/agents/AgentsTable'
import {AGENT_PERFORMANCE_SECTION_TITLE} from 'pages/stats/support-performance/agents/AgentsTableChart'
import {TableColumnsOrder} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {DownloadAgentsPerformanceDataButton} from 'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton'
import SupportPerformanceAgentsReport, {
    AGENTS_PAGE_TITLE,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReport'
import {AGENTS_OPTIONAL_FILTERS} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {TopCsatPerformers} from 'pages/stats/support-performance/agents/TopCsatPerformers'
import {TopFirstResponseTimePerformers} from 'pages/stats/support-performance/agents/TopFirstResponseTimePerformers'
import {TopResponseTimePerformers} from 'pages/stats/support-performance/agents/TopResponseTimePerformers'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'
import {RootState} from 'state/types'
import {assumeMock, renderWithStore} from 'utils/testing'

import {TopClosedTicketsPerformers} from '../TopClosedTicketsPerformers'

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
jest.mock(
    'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton'
)
const DownloadAgentsPerformanceDataButtonMock = assumeMock(
    DownloadAgentsPerformanceDataButton
)
jest.mock('pages/stats/support-performance/agents/TopCsatPerformers')
const TopCsatPerformersMock = assumeMock(TopCsatPerformers)
jest.mock(
    'pages/stats/support-performance/agents/TopFirstResponseTimePerformers'
)
const TopFirstResponseTimePerformersMock = assumeMock(
    TopFirstResponseTimePerformers
)
jest.mock('pages/stats/support-performance/agents/TopResponseTimePerformers')
const TopResponseTimePerformersMock = assumeMock(TopResponseTimePerformers)
jest.mock('pages/stats/support-performance/agents/TopClosedTicketsPerformers')
const TopClosedTicketsPerformersMock = assumeMock(TopClosedTicketsPerformers)
jest.mock('pages/stats/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock('hooks/reporting/support-performance/agents/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)
jest.mock('hooks/reporting/support-performance/agents/useAgentsSummaryMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)
jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
const componentMock = () => <div />

const defaultState = {
    billing: fromJS(billingState),
} as RootState

describe('SupportPerformanceAgents', () => {
    SupportPerformanceFiltersMock.mockImplementation(componentMock)
    AgentsPerformanceCardExtraMock.mockImplementation(componentMock)
    AgentTableWithDefaultStateMock.mockImplementation(componentMock)
    TopCsatPerformersMock.mockImplementation(componentMock)
    TopFirstResponseTimePerformersMock.mockImplementation(componentMock)
    TopResponseTimePerformersMock.mockImplementation(componentMock)
    TopClosedTicketsPerformersMock.mockImplementation(componentMock)
    DownloadAgentsPerformanceDataButtonMock.mockImplementation(componentMock)
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
        renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState
        )

        expect(screen.getByText(AGENTS_PAGE_TITLE)).toBeInTheDocument()
        expect(
            screen.getByText(AGENT_PERFORMANCE_SECTION_TITLE)
        ).toBeInTheDocument()
    })

    it('should render the export data button', () => {
        renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState
        )

        expect(DownloadAgentsPerformanceDataButtonMock).toHaveBeenCalled()
    })

    it('should render the HeatmapSwitch and Agents Shoutout', () => {
        renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState
        )

        expect(AgentsPerformanceCardExtraMock).toHaveBeenCalled()
        expect(TopCsatPerformersMock).toHaveBeenCalled()
        expect(TopFirstResponseTimePerformersMock).toHaveBeenCalled()
        expect(TopResponseTimePerformersMock).toHaveBeenCalled()
        expect(TopClosedTicketsPerformersMock).toHaveBeenCalled()
    })

    it('should render New FiltersPanel and hide legacy filters', () => {
        mockFlags({[FeatureFlagKey.AnalyticsNewFilters]: true})

        const {getByText, queryByText} = renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState
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

        const {getByText} = renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            defaultState
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
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.AutoQAFilters]: true,
        })
        const extendedOptionalFilters = [
            ...AGENTS_OPTIONAL_FILTERS,
            FilterKey.ResolutionCompleteness,
            FilterKey.CommunicationSkills,
        ]

        const {getByText} = renderWithStore(
            <MemoryRouter>
                <SupportPerformanceAgentsReport />
            </MemoryRouter>,
            state
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
