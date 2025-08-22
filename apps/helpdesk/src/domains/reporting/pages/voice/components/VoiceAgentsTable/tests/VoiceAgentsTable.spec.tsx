import { ComponentProps } from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { act, fireEvent, waitFor } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { AgentsCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsCellContent'
import { AgentsHeaderCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent'
import { VoiceAgentsTable } from 'domains/reporting/pages/voice/components/VoiceAgentsTable/VoiceAgentsTable'
import {
    getPaginatedAgents,
    getSortedAgents,
    isSortingMetricLoading,
    pageSet,
} from 'domains/reporting/state/ui/stats/voiceAgentsPerformanceSlice'
import { agents } from 'fixtures/agents'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/voice/components/VoiceAgentsTable/TeamAverageTalkTimeCell',
    () => () => <div>TeamAverageTalkTimeCell</div>,
)
jest.mock(
    'domains/reporting/pages/voice/components/VoiceAgentsTable/TeamAverageCallsCountCell',
    () => () => <div>TeamAverageCallsCountCell</div>,
)

jest.mock(
    'domains/reporting/state/ui/stats/voiceAgentsPerformanceSlice',
    () =>
        ({
            ...jest.requireActual(
                'domains/reporting/state/ui/stats/voiceAgentsPerformanceSlice',
            ),
            getSortedAgents: jest.fn(),
            getPaginatedAgents: jest.fn(),
            isSortingMetricLoading: jest.fn(),
            getHeatmapMode: jest.fn(),
        }) as Record<string, any>,
)
jest.mock(
    'domains/reporting/state/stats/selectors',
    () =>
        ({
            ...jest.requireActual('domains/reporting/state/stats/selectors'),
            getCleanStatsFilters: jest.fn(),
            useStatsFilters: jest.fn(),
        }) as Record<string, any>,
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModalTrigger.tsx',
    () => ({
        DrillDownModalTrigger: ({
            children,
        }: ComponentProps<typeof DrillDownModalTrigger>) => children,
    }),
)
const getSortedAgentsMock = assumeMock(getSortedAgents)
const getPaginatedAgentsMock = assumeMock(getPaginatedAgents)
const isSortingMetricLoadingMock = assumeMock(isSortingMetricLoading)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsCellContent',
)
const AgentsCellContentMock = assumeMock(AgentsCellContent)

jest.mock(
    'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent.tsx',
)
const AgentsHeaderCellContentMock = assumeMock(AgentsHeaderCellContent)

describe('VoiceCallTable', () => {
    const currentPage = 2
    getSortedAgentsMock.mockReturnValue(agents)
    const paginatedAgents = agents.slice(1)
    getPaginatedAgentsMock.mockReturnValue({
        agents: paginatedAgents,
        allAgents: agents,
        currentPage,
        perPage: 1,
    })

    const statsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }
    const statsFiltersWithTimeZone = {
        cleanStatsFilters: statsFilters,
        userTimezone: 'UTC',
        granularity: 'Day' as any,
    }

    beforeEach(() => {
        isSortingMetricLoadingMock.mockReturnValue(false)
        AgentsCellContentMock.mockImplementation(() => (
            <div>AgentsCellContentMock</div>
        ))
        AgentsHeaderCellContentMock.mockImplementation(({ title }) => (
            <div>{title}</div>
        ))
        useStatsFiltersMock.mockReturnValue(statsFiltersWithTimeZone)
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                return true
            }
        })
    })

    const renderComponent = (store: any = {}) =>
        renderWithStore(<VoiceAgentsTable />, store)

    it('should render table with all cells when feature flag is enabled', () => {
        const { getByText, getAllByText } = renderComponent()

        expect(getByText('Agent')).toBeInTheDocument()
        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('Inbound Answered')).toBeInTheDocument()
        expect(getByText('Inbound Transferred')).toBeInTheDocument()
        expect(getByText('Inbound Missed')).toBeInTheDocument()
        expect(getByText('Inbound Declined')).toBeInTheDocument()
        expect(getByText('Outbound')).toBeInTheDocument()
        expect(getByText('Avg. Talk Time')).toBeInTheDocument()

        expect(getByText('Average')).toBeInTheDocument()
        expect(getAllByText('TeamAverageCallsCountCell')).toHaveLength(6)
        expect(getByText('TeamAverageTalkTimeCell')).toBeInTheDocument()

        expect(getByText('Bob Smith')).toBeInTheDocument()
        expect(getAllByText('AgentsCellContentMock')).toHaveLength(7)

        expect(getByText(currentPage)).toBeInTheDocument()
    })

    it('should render table without transferred calls column when feature flag is disabled', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                return false
            }
        })

        const { getByText, queryByText, getAllByText } = renderComponent()

        expect(getByText('Agent')).toBeInTheDocument()
        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('Inbound Answered')).toBeInTheDocument()
        expect(queryByText('Inbound Transferred')).not.toBeInTheDocument()
        expect(getByText('Inbound Missed')).toBeInTheDocument()
        expect(getByText('Inbound Declined')).toBeInTheDocument()
        expect(getByText('Outbound')).toBeInTheDocument()
        expect(getByText('Avg. Talk Time')).toBeInTheDocument()

        expect(getByText('Average')).toBeInTheDocument()
        expect(getAllByText('TeamAverageCallsCountCell')).toHaveLength(5)
        expect(getByText('TeamAverageTalkTimeCell')).toBeInTheDocument()

        expect(getByText('Bob Smith')).toBeInTheDocument()
        expect(getAllByText('AgentsCellContentMock')).toHaveLength(6)

        expect(getByText(currentPage)).toBeInTheDocument()
    })

    it('should handle table scrolling', async () => {
        const { container, getAllByRole } = renderComponent()

        act(() => {
            const tableRow = container.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 50 } })
        })

        await waitFor(() => {
            expect(getAllByRole('cell')[0]).toHaveClass('withShadow')
        })
    })

    it('should not render Pagination if fewer agents then perPage', () => {
        getPaginatedAgentsMock.mockReturnValue({
            agents,
            allAgents: agents,
            currentPage: 1,
            perPage: agents.length + 1,
        })

        const { queryByText } = renderComponent()

        expect(queryByText(currentPage)).not.toBeInTheDocument()
    })

    it('should dispatch pageSet action on page change', () => {
        const pageToClick = currentPage - 1
        getPaginatedAgentsMock.mockReturnValue({
            agents,
            allAgents: agents,
            currentPage,
            perPage: 1,
        })

        const { store, getByText } = renderComponent()

        act(() => {
            const pageButton = getByText(pageToClick)
            userEvent.click(pageButton)
        })

        expect(store.getActions()).toContainEqual(pageSet(pageToClick))
    })

    it('should render table tooltips', async () => {
        renderComponent()

        expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Total calls',
                hint: {
                    title: 'Total number of calls that rung an agent, including calls that the agent missed or declined.',
                },
            }),
            {},
        )

        expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Inbound Transferred',
                hint: {
                    title: 'Total number of transferred calls to an agent, queue or external number.',
                },
            }),
            {},
        )

        expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Avg. Talk Time',
                hint: {
                    title: 'Average time agent spent talking to customers',
                },
            }),
            {},
        )
    })

    it('should not render transferred calls tooltip when feature flag is disabled', async () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.TransferCallToExternalNumber) {
                return false
            }
        })
        renderComponent()

        expect(AgentsHeaderCellContentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Total calls',
                hint: {
                    title: 'Total number of calls that rung an agent, including calls that the agent missed or declined.',
                },
            }),
            {},
        )

        expect(AgentsHeaderCellContentMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Inbound Transferred',
            }),
            {},
        )
    })
})
