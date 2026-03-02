import { assumeMock } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { AgentAvailabilityTable } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTable'
import { useAgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData'
import { sortAgentAvailability } from 'domains/reporting/pages/support-performance/agents/sortAgentAvailability'
import {
    mockAgents,
    mockCustomStatusWithData,
    mockStatsFilters,
    mockTransformedAgents,
    renderWithProviders,
} from 'domains/reporting/pages/support-performance/agents/tests/fixtures'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { initialState as statsTablesInitialState } from 'domains/reporting/state/ui/stats/statsTablesReducer'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

jest.mock(
    'domains/reporting/pages/support-performance/agents/hooks/useAgentAvailabilityData',
)
jest.mock(
    'domains/reporting/pages/support-performance/agents/sortAgentAvailability',
)
jest.mock(
    'domains/reporting/state/ui/stats/agentAvailabilitySlice',
    () =>
        ({
            ...jest.requireActual(
                'domains/reporting/state/ui/stats/agentAvailabilitySlice',
            ),
            getAgentSorting: jest.fn(),
            getAgentsPagination: jest.fn(),
        }) as Record<string, any>,
)

const useAgentAvailabilityDataMock = assumeMock(useAgentAvailabilityData)
const sortAgentAvailabilityMock = assumeMock(sortAgentAvailability)

// Import the mocked selectors AFTER the jest.mock() call
// eslint-disable-next-line @typescript-eslint/no-var-requires
const agentAvailabilitySlice = require('domains/reporting/state/ui/stats/agentAvailabilitySlice')
const getAgentSortingMock = assumeMock(agentAvailabilitySlice.getAgentSorting)
const getAgentsPaginationMock = assumeMock(
    agentAvailabilitySlice.getAgentsPagination,
)

describe('AgentAvailabilityTable', () => {
    beforeEach(() => {
        useAgentAvailabilityDataMock.mockReturnValue({
            agents: mockTransformedAgents,
            customStatuses: [],
            isLoading: false,
            isError: false,
            isErrorCustomStatuses: false,
        })

        // Mock selectors with default values
        getAgentSortingMock.mockReturnValue({
            field: 'agent_online_time',
            direction: OrderDirection.Desc,
            isLoading: false,
            lastSortingMetric: null,
        })

        getAgentsPaginationMock.mockReturnValue({
            currentPage: 1,
            perPage: 20,
        })
        sortAgentAvailabilityMock.mockImplementation((agents) => agents)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (
        agents = mockAgents,
        overrideState: Partial<RootState> = {},
    ) => {
        return renderWithProviders(
            <AgentAvailabilityTable
                allAgents={agents}
                statsFilters={mockStatsFilters}
            />,
            overrideState,
        )
    }

    describe('Basic rendering', () => {
        it('should render without crashing', () => {
            const { container } = renderComponent()
            expect(container).toBeInTheDocument()
        })

        it('should display loading skeleton when data is loading', () => {
            useAgentAvailabilityDataMock.mockReturnValue({
                agents: [],
                customStatuses: [],
                isLoading: true,
                isError: false,
                isErrorCustomStatuses: false,
            })

            renderComponent()

            expect(screen.queryByText('Alice Agent')).not.toBeInTheDocument()
            expect(screen.queryByText('Bob Agent')).not.toBeInTheDocument()
        })
    })

    describe('Data fetching and display', () => {
        it('should fetch and display agent availability data', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Alice Agent')).toBeInTheDocument()
            })

            expect(screen.getByText('Bob Agent')).toBeInTheDocument()
            expect(screen.getByText('Charlie Agent')).toBeInTheDocument()
        })

        it('should display system status columns', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Available')).toBeInTheDocument()
            })

            expect(screen.getByText('Unavailable')).toBeInTheDocument()
        })

        it('should display custom status columns when present', async () => {
            useAgentAvailabilityDataMock.mockReturnValue({
                agents: mockTransformedAgents,
                customStatuses: mockCustomStatusWithData.data.data,
                isLoading: false,
                isError: false,
                isErrorCustomStatuses: false,
            })

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch Break')).toBeInTheDocument()
            })
        })

        it('should display Total and Average summary rows', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Total')).toBeInTheDocument()
            })

            expect(screen.getByText('Average')).toBeInTheDocument()
        })
    })

    describe('Sorting functionality', () => {
        it('should render agents in the order returned by sortAgentAvailability', async () => {
            const sortedOrder = [
                mockTransformedAgents[1], // Bob
                mockTransformedAgents[2], // Charlie
                mockTransformedAgents[0], // Alice
            ]
            sortAgentAvailabilityMock.mockReturnValue(sortedOrder)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Bob Agent')).toBeInTheDocument()
            })

            const agentRows = Array.from(
                screen.getByRole('table').querySelectorAll('tbody tr'),
            ).slice(2) // skip Total and Average summary rows

            expect(agentRows[0].textContent).toContain('Bob Agent')
            expect(agentRows[1].textContent).toContain('Charlie Agent')
            expect(agentRows[2].textContent).toContain('Alice Agent')
        })

        it('should pass agents and sorting state to sortAgentAvailability', () => {
            renderComponent()

            expect(sortAgentAvailabilityMock).toHaveBeenCalledWith(
                mockTransformedAgents,
                expect.objectContaining({ field: expect.any(String) }),
            )
        })

        it('should display sortable column headers', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Online')).toBeInTheDocument()
            })

            expect(screen.getByText('Available')).toBeInTheDocument()
            expect(screen.getByText('Unavailable')).toBeInTheDocument()
        })
    })

    describe('Pagination', () => {
        // TODO: Fix selector mocking - mock store doesn't properly handle Redux Toolkit selectors with small perPage values
        it.skip('should display only paginated agents', async () => {
            // Override pagination to show only 2 per page
            getAgentsPaginationMock.mockReturnValue({
                currentPage: 1,
                perPage: 2,
            })

            // @ts-expect-error - Partial state for testing
            const paginatedState = {
                stats: {
                    filters: defaultStatsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters:
                                mockStatsFilters.cleanStatsFilters,
                            userTimezone: mockStatsFilters.userTimezone,
                        },
                        statsTables: {
                            ...statsTablesInitialState,
                            agentAvailability: {
                                sorting: {
                                    field: 'agent_online_time',
                                    direction: OrderDirection.Desc,
                                    isLoading: false,
                                    lastSortingMetric: null,
                                },
                                pagination: {
                                    currentPage: 1,
                                    perPage: 2, // Only 2 per page
                                },
                                heatmapMode: false,
                            },
                        },
                    },
                },
            } as Partial<RootState>

            renderComponent(mockAgents, paginatedState)

            await waitFor(() => {
                expect(screen.getByText('Alice Agent')).toBeInTheDocument()
            })

            expect(screen.getByText('Bob Agent')).toBeInTheDocument()
            expect(screen.queryByText('Charlie Agent')).not.toBeInTheDocument()
        })

        // TODO: Fix selector mocking - same issue as above
        it.skip('should show pagination controls when total pages > 1', async () => {
            // Override pagination to show only 1 per page
            getAgentsPaginationMock.mockReturnValue({
                currentPage: 1,
                perPage: 1,
            })

            // @ts-expect-error - Partial state for testing
            const paginatedState = {
                stats: {
                    filters: defaultStatsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters:
                                mockStatsFilters.cleanStatsFilters,
                            userTimezone: mockStatsFilters.userTimezone,
                        },
                        statsTables: {
                            ...statsTablesInitialState,
                            agentAvailability: {
                                sorting: {
                                    field: 'agent_online_time',
                                    direction: OrderDirection.Desc,
                                    isLoading: false,
                                    lastSortingMetric: null,
                                },
                                pagination: {
                                    currentPage: 1,
                                    perPage: 1, // Force pagination
                                },
                                heatmapMode: false,
                            },
                        },
                    },
                },
            } as Partial<RootState>

            renderComponent(mockAgents, paginatedState)

            await waitFor(() => {
                expect(screen.getByText('Alice Agent')).toBeInTheDocument()
            })

            // With perPage=1, should only show 1 agent per page (pagination is working)
            expect(screen.getByText('Alice Agent')).toBeInTheDocument()
            // Other agents should not be visible on first page
            expect(screen.queryByText('Bob Agent')).not.toBeInTheDocument()
            expect(screen.queryByText('Charlie Agent')).not.toBeInTheDocument()
        })

        it('should hide pagination when all agents fit on one page', async () => {
            // @ts-expect-error - Partial state for testing
            const noPaginationState = {
                stats: {
                    filters: defaultStatsFilters,
                },
                ui: {
                    stats: {
                        filters: {
                            cleanStatsFilters:
                                mockStatsFilters.cleanStatsFilters,
                            userTimezone: mockStatsFilters.userTimezone,
                        },
                        statsTables: {
                            ...statsTablesInitialState,
                            agentAvailability: {
                                sorting: {
                                    field: 'agent_online_time',
                                    direction: OrderDirection.Desc,
                                    isLoading: false,
                                    lastSortingMetric: null,
                                },
                                pagination: {
                                    currentPage: 1,
                                    perPage: 20,
                                },
                                heatmapMode: false,
                            },
                        },
                    },
                },
            } as Partial<RootState>

            renderComponent(mockAgents, noPaginationState)

            await waitFor(() => {
                expect(screen.getByText('Alice Agent')).toBeInTheDocument()
            })

            const allButtons = screen.queryAllByRole('button')
            const pageButtons = allButtons.filter((btn) => {
                const text = btn.textContent
                return text === '1' || text === '2' || text === '3'
            })
            expect(pageButtons).toHaveLength(0)
        })
    })

    describe('Error handling', () => {
        it('should display error message when data fetching fails', async () => {
            useAgentAvailabilityDataMock.mockReturnValue({
                agents: [],
                customStatuses: [],
                isLoading: false,
                isError: true,
                isErrorCustomStatuses: false,
            })

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Error loading availability data. Please try again.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Edge cases', () => {
        it('should display empty state when no agents provided', async () => {
            useAgentAvailabilityDataMock.mockReturnValue({
                agents: [],
                customStatuses: [],
                isLoading: false,
                isError: false,
                isErrorCustomStatuses: false,
            })

            renderComponent([])

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'No availability data available for the selected period.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should display agents with placeholders when no availability data', async () => {
            useAgentAvailabilityDataMock.mockReturnValue({
                agents: [
                    {
                        id: 1,
                        name: 'Alice Agent',
                        email: 'alice@example.com',
                        avatarUrl: undefined,
                    },
                    {
                        id: 2,
                        name: 'Bob Agent',
                        email: 'bob@example.com',
                        avatarUrl: undefined,
                    },
                ],
                customStatuses: [],
                isLoading: false,
                isError: false,
                isErrorCustomStatuses: false,
            })

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Alice Agent')).toBeInTheDocument()
            })

            expect(screen.getByText('Bob Agent')).toBeInTheDocument()

            const naPlaceholders = screen.getAllByText('-')
            expect(naPlaceholders.length).toBeGreaterThan(0)
        })
    })
})
