import '@testing-library/jest-dom'

import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import type { SortingState } from '@gorgias/axiom'

import { user } from 'fixtures/users'
import { useFaqHelpCenter } from 'pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter'
import { useKnowledgeHubSortingPreference } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubSortingPreference'
import { KnowledgeHubTable } from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import type {
    GroupedKnowledgeItem,
    KnowledgeItem,
} from 'pages/aiAgent/KnowledgeHub/types'
import { EMPTY_HELP_CENTER_ID } from 'pages/automate/common/components/HelpCenterSelect'

const mockStore = configureMockStore()

jest.mock('pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubSortingPreference')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))

jest.mock('pages/aiAgent/hooks/useSyncStoreDomain', () => ({
    useSyncStoreDomain: jest.fn(() => ({
        storeDomain: 'example.com',
        storeUrl: 'https://example.com',
        storeDomainIngestionLog: null,
        isFetchLoading: false,
        syncTriggered: false,
        handleTriggerSync: jest.fn(),
        handleOnSync: jest.fn(),
        handleOnCancel: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(() => ({
        storeConfiguration: { helpCenterId: 1 },
        isLoading: false,
    })),
}))

jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/utils', () => ({
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))

jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter')

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

jest.mock('pages/aiAgent/hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: jest.fn(() => ({
        guidanceArticle: null,
        isLoading: false,
    })),
}))

const mockUseFaqHelpCenter = useFaqHelpCenter as jest.MockedFunction<
    typeof useFaqHelpCenter
>

const mockUseKnowledgeHubSortingPreference =
    useKnowledgeHubSortingPreference as jest.MockedFunction<
        typeof useKnowledgeHubSortingPreference
    >

const defaultState = {
    currentUser: Map(user),
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const mockMetricsDateRange = {
    start_datetime: '2025-01-01T00:00:00Z',
    end_datetime: '2025-01-29T00:00:00Z',
}

const defaultProps = {
    data: [],
    metricsDateRange: mockMetricsDateRange,
    isMetricsEnabled: false,
    isMetricsLoading: false,
    isLoading: false,
    onRowClick: jest.fn(),
    selectedFolder: null,
    searchTerm: '',
    onSearchChange: jest.fn(),
    dateRange: { startDate: null, endDate: null },
    onDateRangeChange: jest.fn(),
    inUseByAIFilter: null,
    onInUseByAIChange: jest.fn(),
    shopType: 'shopify',
    clearSearchParams: jest.fn(),
}

const renderComponent = (props = {}) => {
    return render(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <KnowledgeHubTable {...defaultProps} {...props} />
                </MemoryRouter>
            </QueryClientProvider>
        </Provider>,
    )
}

const rerenderComponent = async (rerender: any, props = {}) => {
    await act(async () => {
        rerender(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <KnowledgeHubTable {...defaultProps} {...props} />
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>,
        )
    })
}

describe('KnowledgeHubTable - displayData useMemo Logic', () => {
    let currentSortState: SortingState

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()

        currentSortState = []

        mockUseKnowledgeHubSortingPreference.mockImplementation(() => ({
            get sortState() {
                return currentSortState
            },
            setSortState: jest.fn((newStateOrUpdater) => {
                currentSortState =
                    typeof newStateOrUpdater === 'function'
                        ? newStateOrUpdater(currentSortState)
                        : newStateOrUpdater
            }),
        }))

        mockUseFaqHelpCenter.mockReturnValue({
            faqHelpCenters: [],
            selectedHelpCenter: {
                id: EMPTY_HELP_CENTER_ID,
                name: 'No help center',
            },
            setHelpCenterId: jest.fn(),
            handleOnSave: jest.fn(),
            shopName: 'test-shop',
            isPendingCreateOrUpdate: false,
            helpCenterItems: [{ id: -1, name: 'No help center' }],
        })
    })

    afterEach(async () => {
        await act(async () => {})
    })

    describe('Branch 1: No sort active (sortState.length === 0)', () => {
        it('should render items in original order when no sort is applied', () => {
            const mockSortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra Guidance',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha Guidance',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta Guidance',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            renderComponent({ data: mockSortableData })

            const rows = screen.getAllByRole('row')
            const dataRows = rows.slice(1)

            expect(
                within(dataRows[0]).getByText('Zebra Guidance'),
            ).toBeInTheDocument()
            expect(
                within(dataRows[1]).getByText('Alpha Guidance'),
            ).toBeInTheDocument()
            expect(
                within(dataRows[2]).getByText('Beta Guidance'),
            ).toBeInTheDocument()
        })

        it('should reflect data changes immediately when unsorted', async () => {
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'First Item',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Second Item',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            expect(screen.getByText('First Item')).toBeInTheDocument()
            expect(screen.getByText('Second Item')).toBeInTheDocument()

            const updatedData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'First Item EDITED',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Second Item',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Third Item NEW',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            await rerenderComponent(rerender, { data: updatedData })

            expect(screen.getByText('First Item EDITED')).toBeInTheDocument()
            expect(screen.getByText('Third Item NEW')).toBeInTheDocument()
        })
    })

    describe('Branch 2: Sort state changed (fresh sort)', () => {
        it('should sort ascending when clicking column header for the first time', async () => {
            const user = userEvent.setup()
            const mockSortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra Guidance',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha Guidance',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta Guidance',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            renderComponent({ data: mockSortableData })

            const titleHeader = screen.getByText('Title').closest('button')
            expect(titleHeader).toBeInTheDocument()

            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Alpha Guidance'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta Guidance'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra Guidance'),
                ).toBeInTheDocument()
            })
        })

        it('should apply sort in correct direction on first click', async () => {
            const user = userEvent.setup()
            const mockSortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra Guidance',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha Guidance',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta Guidance',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            renderComponent({ data: mockSortableData })

            const titleHeader = screen.getByText('Title').closest('button')
            expect(titleHeader).toBeInTheDocument()

            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha Guidance'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta Guidance'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra Guidance'),
                ).toBeInTheDocument()
            })
        })

        it('should switch sort column when clicking a different column header', async () => {
            const user = userEvent.setup()
            const mockSortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Charlie Guidance',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha Guidance',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta Guidance',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            renderComponent({ data: mockSortableData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha Guidance'),
                ).toBeInTheDocument()
            })

            const dateHeader = screen
                .getByText('Last updated')
                .closest('button')
            await act(async () => {
                await user.click(dateHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Alpha Guidance'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta Guidance'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Charlie Guidance'),
                ).toBeInTheDocument()
            })
        })

        it('should sort by inUseByAI column correctly', async () => {
            const user = userEvent.setup()
            const mockSortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'First',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Second',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 1,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Third',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
            ]

            renderComponent({ data: mockSortableData })

            const inUseHeader = screen.getByRole('button', {
                name: /in use by ai agent/i,
            })
            expect(inUseHeader).toBeInTheDocument()

            await act(async () => {
                await user.click(inUseHeader)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Second'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Branch 3: Stable row order (data updates without sort change)', () => {
        it('should maintain row positions when an item is edited', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra'),
                ).toBeInTheDocument()
            })

            const updatedData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra EDITED',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            await rerenderComponent(rerender, { data: updatedData })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra EDITED'),
                ).toBeInTheDocument()
            })
        })

        it('should add new item at the end while maintaining existing order', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Zebra'),
                ).toBeInTheDocument()
            })

            const dataWithNewItem: KnowledgeItem[] = [
                ...initialData,
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Charlie NEW',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            await rerenderComponent(rerender, { data: dataWithNewItem })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Zebra'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Charlie NEW'),
                ).toBeInTheDocument()
            })
        })

        it('should handle multiple new items added at the end', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
            })

            const dataWithMultipleNewItems: KnowledgeItem[] = [
                ...initialData,
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Delta NEW',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '4',
                    type: KnowledgeType.Guidance,
                    title: 'Charlie NEW',
                    lastUpdatedAt: '2024-01-04T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            await rerenderComponent(rerender, {
                data: dataWithMultipleNewItems,
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Zebra'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Delta NEW'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[3]).getByText('Charlie NEW'),
                ).toBeInTheDocument()
            })
        })

        it('should remove deleted item without affecting other positions', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra'),
                ).toBeInTheDocument()
            })

            const dataWithItemDeleted: KnowledgeItem[] = [
                initialData[0],
                initialData[2],
            ]

            await rerenderComponent(rerender, { data: dataWithItemDeleted })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Zebra'),
                ).toBeInTheDocument()
                expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
            })
        })

        it('should handle bulk operations maintaining stable order', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
            })

            const dataAfterBulkEnable: KnowledgeItem[] = initialData.map(
                (item) => ({
                    ...item,
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                }),
            )

            await rerenderComponent(rerender, { data: dataAfterBulkEnable })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra'),
                ).toBeInTheDocument()
            })
        })

        it('should not re-sort when item properties change', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Zebra'),
                ).toBeInTheDocument()
            })

            const updatedData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Aardvark',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            await rerenderComponent(rerender, { data: updatedData })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Aardvark'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Branch 4: Async metrics data triggers re-sort', () => {
        const metricsBaseData: KnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.Guidance,
                title: 'Item A',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
            },
            {
                id: '2',
                type: KnowledgeType.Guidance,
                title: 'Item B',
                lastUpdatedAt: '2024-01-02T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
            },
            {
                id: '3',
                type: KnowledgeType.Guidance,
                title: 'Item C',
                lastUpdatedAt: '2024-01-03T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
            },
        ]

        const enrichWithMetrics = (
            data: KnowledgeItem[],
        ): GroupedKnowledgeItem[] => {
            const metricsValues = [
                { tickets: 5, handoverTickets: 2, csat: 70 },
                { tickets: 50, handoverTickets: 10, csat: 90 },
                { tickets: 20, handoverTickets: 5, csat: 80 },
            ]

            return data.map((item, i) => ({
                ...item,
                metrics: {
                    ...metricsValues[i],
                    resourceSourceSetId: i + 1,
                },
            }))
        }

        it('should re-sort when metrics data arrives after initial sort on metrics column', async () => {
            currentSortState = [{ id: 'metrics.tickets', desc: true }]

            const { rerender } = renderComponent({
                data: metricsBaseData,
                isMetricsEnabled: true,
            })

            await waitFor(() => {
                expect(screen.getByText('Item A')).toBeInTheDocument()
                expect(screen.getByText('Item B')).toBeInTheDocument()
                expect(screen.getByText('Item C')).toBeInTheDocument()
            })

            await rerenderComponent(rerender, {
                data: enrichWithMetrics(metricsBaseData),
                isMetricsEnabled: true,
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Item B'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Item C'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Item A'),
                ).toBeInTheDocument()
            })
        })

        it('should maintain stable order after metrics-based sort when non-sort data changes', async () => {
            currentSortState = [{ id: 'metrics.tickets', desc: true }]

            const dataWithMetrics = enrichWithMetrics(metricsBaseData)

            const { rerender } = renderComponent({
                data: dataWithMetrics,
                isMetricsEnabled: true,
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Item B'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Item C'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Item A'),
                ).toBeInTheDocument()
            })

            const updatedData: GroupedKnowledgeItem[] = [
                { ...dataWithMetrics[0], title: 'Item A EDITED' },
                dataWithMetrics[1],
                dataWithMetrics[2],
            ]

            await rerenderComponent(rerender, {
                data: updatedData,
                isMetricsEnabled: true,
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Item B'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Item C'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Item A EDITED'),
                ).toBeInTheDocument()
            })
        })

        it('should not re-sort on non-metrics column when metrics data arrives', async () => {
            currentSortState = [{ id: 'title', desc: false }]

            const { rerender } = renderComponent({
                data: metricsBaseData,
                isMetricsEnabled: true,
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Item A'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Item B'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Item C'),
                ).toBeInTheDocument()
            })

            await rerenderComponent(rerender, {
                data: enrichWithMetrics(metricsBaseData),
                isMetricsEnabled: true,
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)

                expect(
                    within(dataRows[0]).getByText('Item A'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Item B'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Item C'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Integration: Real user interactions', () => {
        it('should maintain position when editing an item after sorting by title', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra'),
                ).toBeInTheDocument()
            })

            const editedData: KnowledgeItem[] = [
                initialData[0],
                {
                    ...initialData[1],
                    title: 'Alpha UPDATED',
                },
                initialData[2],
            ]

            await rerenderComponent(rerender, { data: editedData })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha UPDATED'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra'),
                ).toBeInTheDocument()
            })
        })

        it('should add new item at end after sorting by date', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Third',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'First',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Second',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const dateHeader = screen
                .getByText('Last updated')
                .closest('button')
            await act(async () => {
                await user.click(dateHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('First'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Second'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Third'),
                ).toBeInTheDocument()
            })

            const dataWithNewItem: KnowledgeItem[] = [
                ...initialData,
                {
                    id: '4',
                    type: KnowledgeType.Guidance,
                    title: 'Fourth NEW',
                    lastUpdatedAt: '2024-01-04T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            await rerenderComponent(rerender, { data: dataWithNewItem })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('First'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Second'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Third'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[3]).getByText('Fourth NEW'),
                ).toBeInTheDocument()
            })
        })

        it('should perform fresh sort when switching columns', async () => {
            const user = userEvent.setup()
            const mockSortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Charlie',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
            ]

            renderComponent({ data: mockSortableData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Charlie'),
                ).toBeInTheDocument()
            })

            const dateHeader = screen
                .getByText('Last updated')
                .closest('button')
            await act(async () => {
                await user.click(dateHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Charlie'),
                ).toBeInTheDocument()
            })
        })

        it('should maintain sort when bulk enabling items', async () => {
            const user = userEvent.setup()
            const initialData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Zebra',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
            ]

            const { rerender } = renderComponent({ data: initialData })

            const titleHeader = screen.getByText('Title').closest('button')
            await act(async () => {
                await user.click(titleHeader!)
            })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra'),
                ).toBeInTheDocument()
            })

            const bulkEnabledData: KnowledgeItem[] = initialData.map(
                (item) => ({
                    ...item,
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                }),
            )

            await rerenderComponent(rerender, { data: bulkEnabledData })

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const dataRows = rows.slice(1)
                expect(
                    within(dataRows[0]).getByText('Alpha'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[1]).getByText('Beta'),
                ).toBeInTheDocument()
                expect(
                    within(dataRows[2]).getByText('Zebra'),
                ).toBeInTheDocument()
            })
        })
    })
})
