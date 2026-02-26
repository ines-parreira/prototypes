import type { ReactElement } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { User } from 'config/types/user'
import { ThemeProvider } from 'core/theme'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import type { AgentAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils/transformAvailabilityData'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { initialState as statsTablesInitialState } from 'domains/reporting/state/ui/stats/statsTablesReducer'
import { OrderDirection } from 'models/api/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

export const mockAgents: User[] = [
    {
        id: 1,
        name: 'Alice Agent',
        email: 'alice@example.com',
        role: { name: 'admin' },
        meta: { profile_picture_url: 'https://example.com/alice.jpg' },
    } as User,
    {
        id: 2,
        name: 'Bob Agent',
        email: 'bob@example.com',
        role: { name: 'agent' },
    } as User,
    {
        id: 3,
        name: 'Charlie Agent',
        email: 'charlie@example.com',
        role: { name: 'agent' },
    } as User,
]

export const mockStatsFilters = {
    cleanStatsFilters: {
        period: {
            start_datetime: '2025-01-01T00:00:00Z',
            end_datetime: '2025-01-31T23:59:59Z',
        },
    },
    userTimezone: 'UTC',
}

export const mockStatsFiltersRaw = {
    period: {
        start_datetime: '2025-01-01T00:00:00Z',
        end_datetime: '2025-01-31T23:59:59Z',
    },
}

export const mockTransformedAgents: AgentAvailabilityData[] = [
    {
        id: 1,
        name: 'Alice Agent',
        email: 'alice@example.com',
        avatarUrl: 'https://example.com/alice.jpg',
        agent_online_time: 3600,
        agent_status_available: {
            total: 1800,
            online: 1800,
            offline: 0,
        },
        agent_status_unavailable: {
            total: 1800,
            online: 900,
            offline: 900,
        },
    },
    {
        id: 2,
        name: 'Bob Agent',
        email: 'bob@example.com',
        avatarUrl: undefined,
        agent_online_time: 7200,
        agent_status_available: {
            total: 3600,
            online: 3600,
            offline: 0,
        },
        agent_status_unavailable: {
            total: 3600,
            online: 1800,
            offline: 1800,
        },
    },
    {
        id: 3,
        name: 'Charlie Agent',
        email: 'charlie@example.com',
        avatarUrl: undefined,
        agent_online_time: 5400,
        agent_status_available: {
            total: 2700,
            online: 2700,
            offline: 0,
        },
        agent_status_unavailable: {
            total: 2700,
            online: 1350,
            offline: 1350,
        },
    },
]

export const mockOnlineTimeData = {
    allValues: [
        { dimension: '1', value: 3600 },
        { dimension: '2', value: 7200 },
        { dimension: '3', value: 5400 },
    ],
}

export const mockPerStatusData = {
    allData: [
        {
            agentId: 1,
            statusName: 'available',
            totalDurationSeconds: 1800,
            onlineDurationSeconds: 1800,
            offlineDurationSeconds: 0,
        },
        {
            agentId: 1,
            statusName: 'unavailable',
            totalDurationSeconds: 1800,
            onlineDurationSeconds: 900,
            offlineDurationSeconds: 900,
        },
        {
            agentId: 2,
            statusName: 'available',
            totalDurationSeconds: 3600,
            onlineDurationSeconds: 3600,
            offlineDurationSeconds: 0,
        },
        {
            agentId: 2,
            statusName: 'unavailable',
            totalDurationSeconds: 3600,
            onlineDurationSeconds: 1800,
            offlineDurationSeconds: 1800,
        },
        {
            agentId: 3,
            statusName: 'available',
            totalDurationSeconds: 2700,
            onlineDurationSeconds: 2700,
            offlineDurationSeconds: 0,
        },
        {
            agentId: 3,
            statusName: 'unavailable',
            totalDurationSeconds: 2700,
            onlineDurationSeconds: 1350,
            offlineDurationSeconds: 1350,
        },
    ],
}

export const mockCustomStatuses = {
    data: {
        data: [],
    },
}

export const mockCustomStatusWithData = {
    data: {
        data: [
            {
                id: 'custom-123',
                name: 'Lunch Break',
                description: 'Agent on lunch',
                created_datetime: '2025-01-01T00:00:00Z',
            },
        ],
    },
}

export const defaultHookReturn = {
    isFetching: false,
    isError: false,
    isLoading: false,
    isSuccess: true,
    error: null,
}

export const basicColumnsOrder = [
    AGENT_AVAILABILITY_COLUMNS.AGENT_NAME_COLUMN,
    AGENT_AVAILABILITY_COLUMNS.ONLINE_TIME_COLUMN,
    AGENT_AVAILABILITY_COLUMNS.AVAILABLE_STATUS_COLUMN,
    AGENT_AVAILABILITY_COLUMNS.UNAVAILABLE_STATUS_COLUMN,
]

export const createDefaultReduxState = (
    overrides?: Partial<RootState>,
): Partial<RootState> =>
    ({
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: mockStatsFilters.cleanStatsFilters,
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
        ...overrides,
    }) as Partial<RootState>

export const renderWithProviders = (
    ui: ReactElement,
    stateOverrides?: Partial<RootState>,
) => {
    const queryClient = mockQueryClient()
    const store = mockStore(createDefaultReduxState(stateOverrides))

    return {
        store,
        queryClient,
        ...render(
            <Provider store={store}>
                <MemoryRouter>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider>{ui}</ThemeProvider>
                    </QueryClientProvider>
                </MemoryRouter>
            </Provider>,
        ),
    }
}

export const renderRowWithProviders = (ui: ReactElement) => {
    const store = mockStore({} as Partial<RootState>)

    return render(
        <Provider store={store}>
            <MemoryRouter>
                <ThemeProvider>{ui}</ThemeProvider>
            </MemoryRouter>
        </Provider>,
    )
}
