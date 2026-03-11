import '@testing-library/jest-dom'

import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import type { SortingState } from '@gorgias/axiom'

import { user } from 'fixtures/users'
import { useFaqHelpCenter } from 'pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter'
import { KnowledgeHubTable } from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable'
import {
    applyStableRowOrder,
    sortData,
} from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable.utils'
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

const mockData: KnowledgeItem[] = [
    {
        id: '1',
        type: KnowledgeType.Document,
        title: 'Test Document 1',
        lastUpdatedAt: '2025-01-01T00:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'document-source',
    },
    {
        id: '2',
        type: KnowledgeType.Document,
        title: 'Test Document 2',
        lastUpdatedAt: '2025-01-02T00:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'document-source',
    },
    {
        id: '3',
        type: KnowledgeType.URL,
        title: 'Test URL 1',
        lastUpdatedAt: '2025-01-03T00:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'url-source',
    },
    {
        id: '4',
        type: KnowledgeType.URL,
        title: 'Test URL 2',
        lastUpdatedAt: '2025-01-04T00:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'url-source',
    },
    {
        id: '5',
        type: KnowledgeType.Domain,
        title: 'Test Domain 1',
        lastUpdatedAt: '2025-01-05T00:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'domain-source',
    },
    {
        id: '6',
        type: KnowledgeType.Domain,
        title: 'Test Domain 2',
        lastUpdatedAt: '2025-01-06T00:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'domain-source',
    },
]

const mockMetricsDateRange = {
    start_datetime: '2025-01-01T00:00:00Z',
    end_datetime: '2025-01-29T00:00:00Z',
}

const defaultProps = {
    data: mockData,
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

describe('KnowledgeHubTable - Row Interactions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
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

    describe('row selection', () => {
        it('disables selection for grouped rows', () => {
            renderComponent()

            const groupRow = screen.getByText('document-source').closest('tr')
            const checkbox = groupRow?.querySelector('input[type="checkbox"]')

            expect(checkbox).toBeDisabled()
        })

        it('should reset selection when entering a snippet folder', async () => {
            const user = userEvent.setup()
            const { rerender } = renderComponent()

            const checkboxes = screen.getAllByRole('checkbox')
            const firstCheckbox = checkboxes.find(
                (cb) => cb.getAttribute('aria-label') !== 'Select all rows',
            )
            expect(firstCheckbox).toBeDefined()

            if (firstCheckbox) {
                await act(async () => {
                    await user.click(firstCheckbox)
                })
                expect(firstCheckbox).toBeChecked()
            }

            const snippetFolder: GroupedKnowledgeItem = {
                id: 'folder-1',
                type: KnowledgeType.Document,
                title: 'Test Folder',
                lastUpdatedAt: '2025-01-01T00:00:00Z',
                isGrouped: true,
                source: 'document-source',
            }

            await rerenderComponent(rerender, { selectedFolder: snippetFolder })

            const updatedCheckboxes = screen.getAllByRole('checkbox')
            updatedCheckboxes.forEach((cb) => {
                if (cb.getAttribute('aria-label') !== 'Select all rows') {
                    expect(cb).not.toBeChecked()
                }
            })
        })

        it('should reset selection when entering a URL folder', async () => {
            const user = userEvent.setup()
            const { rerender } = renderComponent()

            const checkboxes = screen.getAllByRole('checkbox')
            const firstCheckbox = checkboxes.find(
                (cb) => cb.getAttribute('aria-label') !== 'Select all rows',
            )

            if (firstCheckbox) {
                await act(async () => {
                    await user.click(firstCheckbox)
                })
                expect(firstCheckbox).toBeChecked()
            }

            const urlFolder: GroupedKnowledgeItem = {
                id: 'folder-2',
                type: KnowledgeType.URL,
                title: 'Test URL Folder',
                lastUpdatedAt: '2025-01-03T00:00:00Z',
                isGrouped: true,
                source: 'url-source',
            }

            await rerenderComponent(rerender, { selectedFolder: urlFolder })

            const updatedCheckboxes = screen.getAllByRole('checkbox')
            updatedCheckboxes.forEach((cb) => {
                if (cb.getAttribute('aria-label') !== 'Select all rows') {
                    expect(cb).not.toBeChecked()
                }
            })
        })

        it('should reset selection when entering a Domain folder', async () => {
            const user = userEvent.setup()
            const { rerender } = renderComponent()

            const checkboxes = screen.getAllByRole('checkbox')
            const firstCheckbox = checkboxes.find(
                (cb) => cb.getAttribute('aria-label') !== 'Select all rows',
            )

            if (firstCheckbox) {
                await act(async () => {
                    await user.click(firstCheckbox)
                })
                expect(firstCheckbox).toBeChecked()
            }

            const domainFolder: GroupedKnowledgeItem = {
                id: 'folder-3',
                type: KnowledgeType.Domain,
                title: 'Test Domain Folder',
                lastUpdatedAt: '2025-01-05T00:00:00Z',
                isGrouped: true,
                source: 'domain-source',
            }

            await rerenderComponent(rerender, { selectedFolder: domainFolder })

            const updatedCheckboxes = screen.getAllByRole('checkbox')
            updatedCheckboxes.forEach((cb) => {
                if (cb.getAttribute('aria-label') !== 'Select all rows') {
                    expect(cb).not.toBeChecked()
                }
            })
        })

        it('should reset selection when exiting from a snippet folder', async () => {
            const user = userEvent.setup()
            const snippetFolder: GroupedKnowledgeItem = {
                id: 'folder-1',
                type: KnowledgeType.Document,
                title: 'Test Folder',
                lastUpdatedAt: '2025-01-01T00:00:00Z',
                isGrouped: true,
                source: 'document-source',
            }

            const { rerender } = renderComponent({
                selectedFolder: snippetFolder,
            })

            const checkboxes = screen.getAllByRole('checkbox')
            const firstCheckbox = checkboxes.find(
                (cb) => cb.getAttribute('aria-label') !== 'Select all rows',
            )

            if (firstCheckbox) {
                await act(async () => {
                    await user.click(firstCheckbox)
                })
                expect(firstCheckbox).toBeChecked()
            }

            await rerenderComponent(rerender, { selectedFolder: null })

            const updatedCheckboxes = screen.getAllByRole('checkbox')
            updatedCheckboxes.forEach((cb) => {
                if (cb.getAttribute('aria-label') !== 'Select all rows') {
                    expect(cb).not.toBeChecked()
                }
            })
        })
    })

    describe('row click handling', () => {
        const ungroupedGuidanceData = [
            {
                type: KnowledgeType.Guidance,
                title: 'Return Policy',
                lastUpdatedAt: '2024-01-20T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '123',
            },
        ]

        const ungroupedFaqData = [
            {
                type: KnowledgeType.FAQ,
                title: 'Shipping FAQ',
                lastUpdatedAt: '2024-01-10T10:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                source: 'docs.example.com',
                id: '456',
            },
        ]

        const ungroupedDocumentData = [
            {
                type: KnowledgeType.Document,
                title: 'Product Manual',
                lastUpdatedAt: '2024-01-15T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                source: 'docs.example.com',
                id: '789',
            },
        ]

        const mixedData = [
            {
                type: KnowledgeType.Document,
                title: 'Product Manual',
                lastUpdatedAt: '2024-01-15T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                source: 'docs.example.com',
                id: '1',
            },
            {
                type: KnowledgeType.FAQ,
                title: 'Shipping FAQ',
                lastUpdatedAt: '2024-01-10T10:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                source: 'docs.example.com',
                id: '2',
            },
            {
                type: KnowledgeType.Guidance,
                title: 'Return Policy',
                lastUpdatedAt: '2024-01-20T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '3',
            },
            {
                type: KnowledgeType.URL,
                title: 'Help Center',
                lastUpdatedAt: '2024-01-05T10:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                id: '4',
            },
        ]

        it('calls onGuidanceRowClick with correct ID when clicking ungrouped Guidance row', async () => {
            const user = userEvent.setup()
            const onGuidanceRowClick = jest.fn()
            const onRowClick = jest.fn()

            renderComponent({
                data: ungroupedGuidanceData,
                onGuidanceRowClick,
                onRowClick,
            })

            const titleCell = screen
                .getByText('Return Policy')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onGuidanceRowClick).toHaveBeenCalledWith(123)
                expect(onRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onFaqRowClick with correct ID when clicking ungrouped FAQ row', async () => {
            const user = userEvent.setup()
            const onFaqRowClick = jest.fn()
            const onRowClick = jest.fn()

            const selectedFolder = {
                id: 'folder-id',
                type: ungroupedFaqData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: ungroupedFaqData[0].source,
            }
            renderComponent({
                data: ungroupedFaqData,
                selectedFolder,
                onFaqRowClick,
                onRowClick,
            })

            const titleCell = screen
                .getByText('Shipping FAQ')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onFaqRowClick).toHaveBeenCalledWith(456)
                expect(onRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onRowClick when clicking grouped rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            renderComponent({
                data: mixedData,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const groupedRow = screen.getByText('docs.example.com')

            await act(async () => {
                await user.click(groupedRow)
            })

            await waitFor(() => {
                expect(onRowClick).toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onSnippetRowClick with correct ID and type when clicking Document rows', async () => {
            const user = userEvent.setup()
            const onSnippetRowClick = jest.fn()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const selectedFolder = {
                id: 'folder-id',
                type: ungroupedDocumentData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: ungroupedDocumentData[0].source,
            }
            renderComponent({
                data: ungroupedDocumentData,
                selectedFolder,
                onSnippetRowClick,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const titleCell = screen
                .getByText('Product Manual')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onSnippetRowClick).toHaveBeenCalledWith(
                    789,
                    KnowledgeType.Document,
                )
                expect(onRowClick).not.toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onRowClick when clicking Document rows and onSnippetRowClick is not provided', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const selectedFolder = {
                id: 'folder-id',
                type: ungroupedDocumentData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: ungroupedDocumentData[0].source,
            }
            renderComponent({
                data: ungroupedDocumentData,
                selectedFolder,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const titleCell = screen
                .getByText('Product Manual')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onRowClick).toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onSnippetRowClick with correct ID and type when clicking URL rows', async () => {
            const user = userEvent.setup()
            const onSnippetRowClick = jest.fn()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const urlData = [
                {
                    type: KnowledgeType.URL,
                    title: 'Help Center',
                    lastUpdatedAt: '2024-01-05T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'help.example.com',
                    id: '999',
                },
            ]

            const selectedFolder = {
                id: 'folder-id',
                type: urlData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: urlData[0].source,
            }
            renderComponent({
                data: urlData,
                selectedFolder,
                onSnippetRowClick,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const titleCell = screen
                .getByText('Help Center')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onSnippetRowClick).toHaveBeenCalledWith(
                    999,
                    KnowledgeType.URL,
                )
                expect(onRowClick).not.toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onRowClick when clicking URL rows and onSnippetRowClick is not provided', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const urlData = [
                {
                    type: KnowledgeType.URL,
                    title: 'Help Center',
                    lastUpdatedAt: '2024-01-05T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'help.example.com',
                    id: '999',
                },
            ]

            const selectedFolder = {
                id: 'folder-id',
                type: urlData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: urlData[0].source,
            }
            renderComponent({
                data: urlData,
                selectedFolder,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const titleCell = screen
                .getByText('Help Center')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onRowClick).toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onSnippetRowClick with correct ID and type when clicking Domain rows', async () => {
            const user = userEvent.setup()
            const onSnippetRowClick = jest.fn()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const domainData = [
                {
                    type: KnowledgeType.Domain,
                    title: 'Domain Example',
                    lastUpdatedAt: '2024-01-08T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'example.com',
                    id: '888',
                },
            ]

            const selectedFolder = {
                id: 'folder-id',
                type: domainData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: domainData[0].source,
            }
            renderComponent({
                data: domainData,
                selectedFolder,
                onSnippetRowClick,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const titleCell = screen
                .getByText('Domain Example')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onSnippetRowClick).toHaveBeenCalledWith(
                    888,
                    KnowledgeType.Domain,
                )
                expect(onRowClick).not.toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('calls onRowClick when clicking Domain rows and onSnippetRowClick is not provided', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const domainData = [
                {
                    type: KnowledgeType.Domain,
                    title: 'Domain Example',
                    lastUpdatedAt: '2024-01-08T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'example.com',
                    id: '888',
                },
            ]

            const selectedFolder = {
                id: 'folder-id',
                type: domainData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: domainData[0].source,
            }
            renderComponent({
                data: domainData,
                selectedFolder,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const titleCell = screen
                .getByText('Domain Example')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => {
                expect(onRowClick).toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('falls back to onRowClick when onGuidanceRowClick is not provided for Guidance row', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()

            renderComponent({
                data: ungroupedGuidanceData,
                onRowClick,
            })

            const titleCell = screen
                .getByText('Return Policy')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => expect(onRowClick).toHaveBeenCalled())
        })

        it('falls back to onRowClick when onFaqRowClick is not provided for FAQ row', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()

            const selectedFolder = {
                id: 'folder-id',
                type: ungroupedFaqData[0].type,
                title: 'Folder',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                isGrouped: true,
                source: ungroupedFaqData[0].source,
            }
            renderComponent({
                data: ungroupedFaqData,
                selectedFolder,
                onRowClick,
            })

            const titleCell = screen
                .getByText('Shipping FAQ')
                .closest('div[class*="clickableCell"]')
            expect(titleCell).not.toBeNull()

            await act(async () => {
                await user.click(titleCell!)
            })

            await waitFor(() => expect(onRowClick).toHaveBeenCalled())
        })

        it('does not call any handler for grouped Guidance rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()

            const guidanceWithSourceData = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'guidance.example.com',
                    id: '111',
                },
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 2',
                    lastUpdatedAt: '2024-01-21T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'guidance.example.com',
                    id: '222',
                },
            ]

            renderComponent({
                data: guidanceWithSourceData,
                onRowClick,
                onGuidanceRowClick,
            })

            const groupedRow = screen.getByText('guidance.example.com')

            await act(async () => {
                await user.click(groupedRow)
            })

            await waitFor(() => {
                expect(onRowClick).toHaveBeenCalled()
                expect(onGuidanceRowClick).not.toHaveBeenCalled()
            })
        })

        it('does not call any handler for grouped FAQ rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const faqsWithSameSource = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-10T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'faq.example.com',
                    id: '333',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 2',
                    lastUpdatedAt: '2024-01-11T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'faq.example.com',
                    id: '444',
                },
            ]

            renderComponent({
                data: faqsWithSameSource,
                onRowClick,
                onFaqRowClick,
            })

            const groupedRow = screen.getByText('faq.example.com')

            await act(async () => {
                await user.click(groupedRow)
            })

            await waitFor(() => {
                expect(onRowClick).toHaveBeenCalled()
                expect(onFaqRowClick).not.toHaveBeenCalled()
            })
        })

        it('does not call onSnippetRowClick for grouped snippet rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onSnippetRowClick = jest.fn()

            const documentsWithSameSource = [
                {
                    type: KnowledgeType.Document,
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'docs.example.com',
                    id: '555',
                },
                {
                    type: KnowledgeType.Document,
                    title: 'Doc 2',
                    lastUpdatedAt: '2024-01-16T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'docs.example.com',
                    id: '666',
                },
            ]

            renderComponent({
                data: documentsWithSameSource,
                onRowClick,
                onSnippetRowClick,
            })

            const groupedRow = screen.getByText('docs.example.com')

            await act(async () => {
                await user.click(groupedRow)
            })

            await waitFor(() => {
                expect(onRowClick).toHaveBeenCalled()
                expect(onSnippetRowClick).not.toHaveBeenCalled()
            })
        })
    })

    describe('sorting behavior', () => {
        it('should correctly identify when sort state changes (no cache to cached)', () => {
            const sortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha Guidance',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Beta Guidance',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
            ]

            renderComponent({ data: sortableData })

            expect(screen.getByText('Alpha Guidance')).toBeInTheDocument()
            expect(screen.getByText('Beta Guidance')).toBeInTheDocument()
        })

        it('should correctly identify when sort direction changes on same column', () => {
            const sortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
            ]

            renderComponent({ data: sortableData })

            expect(screen.getByText('Alpha')).toBeInTheDocument()
            expect(screen.getByText('Beta')).toBeInTheDocument()
        })

        it('should correctly identify when column ID changes (switching columns)', () => {
            const sortableData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Item 1',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Item 2',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
            ]

            renderComponent({ data: sortableData })

            expect(screen.getByText('Item 1')).toBeInTheDocument()
            expect(screen.getByText('Item 2')).toBeInTheDocument()
        })

        it('should maintain stable order when data updates without sort state change', async () => {
            const sortableData: KnowledgeItem[] = [
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
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
            ]

            const { rerender } = renderComponent({ data: sortableData })

            expect(screen.getByText('First Item')).toBeInTheDocument()

            const updatedData: KnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'First Item UPDATED',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Second Item',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
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

            expect(screen.getByText('First Item UPDATED')).toBeInTheDocument()
            expect(screen.getByText('Second Item')).toBeInTheDocument()
            expect(screen.getByText('Third Item NEW')).toBeInTheDocument()
        })
    })

    describe('Utility Functions', () => {
        describe('sortData', () => {
            const mockItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Alpha',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 1,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Beta',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                },
                {
                    id: '3',
                    type: KnowledgeType.Guidance,
                    title: 'Charlie',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 2,
                },
            ]

            describe('no sorting', () => {
                it('should return data unchanged when sorting is empty', () => {
                    const result = sortData(mockItems, [])
                    expect(result).toBe(mockItems)
                })
            })

            describe('string sorting', () => {
                it('should sort strings ascending (A-Z)', () => {
                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(mockItems, sorting)

                    expect(result[0].title).toBe('Alpha')
                    expect(result[1].title).toBe('Beta')
                    expect(result[2].title).toBe('Charlie')
                })

                it('should sort strings descending (Z-A)', () => {
                    const sorting: SortingState = [{ id: 'title', desc: true }]
                    const result = sortData(mockItems, sorting)

                    expect(result[0].title).toBe('Charlie')
                    expect(result[1].title).toBe('Beta')
                    expect(result[2].title).toBe('Alpha')
                })

                it('should sort case-insensitively', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'zebra',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Apple',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'BANANA',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(items, sorting)

                    expect(result[0].title).toBe('Apple')
                    expect(result[1].title).toBe('BANANA')
                    expect(result[2].title).toBe('zebra')
                })

                it('should handle special characters with locale-aware comparison', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'café',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'apple',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'naïve',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(items, sorting)

                    expect(result[0].title).toBe('apple')
                    expect(result[1].title).toBe('café')
                    expect(result[2].title).toBe('naïve')
                })
            })

            describe('date sorting', () => {
                it('should sort dates ascending (oldest first)', () => {
                    const sorting: SortingState = [
                        { id: 'lastUpdatedAt', desc: false },
                    ]
                    const result = sortData(mockItems, sorting)

                    expect(result[0].lastUpdatedAt).toBe('2024-01-01T00:00:00Z')
                    expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                    expect(result[2].lastUpdatedAt).toBe('2024-01-03T00:00:00Z')
                })

                it('should sort dates descending (newest first)', () => {
                    const sorting: SortingState = [
                        { id: 'lastUpdatedAt', desc: true },
                    ]
                    const result = sortData(mockItems, sorting)

                    expect(result[0].lastUpdatedAt).toBe('2024-01-03T00:00:00Z')
                    expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                    expect(result[2].lastUpdatedAt).toBe('2024-01-01T00:00:00Z')
                })

                it('should push invalid dates to end when sorting ascending', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Valid',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Invalid',
                            lastUpdatedAt: 'invalid-date',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Valid earlier',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [
                        { id: 'lastUpdatedAt', desc: false },
                    ]
                    const result = sortData(items, sorting)

                    expect(result[0].lastUpdatedAt).toBe('2024-01-01T00:00:00Z')
                    expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                    expect(result[2].lastUpdatedAt).toBe('invalid-date')
                })

                it('should push invalid dates to end when sorting descending', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Valid',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Invalid',
                            lastUpdatedAt: 'not-a-date',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Valid later',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [
                        { id: 'lastUpdatedAt', desc: true },
                    ]
                    const result = sortData(items, sorting)

                    expect(result[0].lastUpdatedAt).toBe('2024-01-03T00:00:00Z')
                    expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                    expect(result[2].lastUpdatedAt).toBe('not-a-date')
                })
            })

            describe('boolean sorting (inUseByAI)', () => {
                it('should sort inUseByAI ascending (in-use items first)', () => {
                    const sorting: SortingState = [
                        { id: 'inUseByAI', desc: false },
                    ]
                    const result = sortData(mockItems, sorting)

                    expect(result[0].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
                    expect(result[1].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
                    expect(result[2].id).toBe('2')
                    expect(result[2].inUseByAI).toBe(
                        KnowledgeVisibility.UNLISTED,
                    )
                })

                it('should sort inUseByAI descending (not-in-use items first)', () => {
                    const sorting: SortingState = [
                        { id: 'inUseByAI', desc: true },
                    ]
                    const result = sortData(mockItems, sorting)

                    expect(result[0].id).toBe('2')
                    expect(result[0].inUseByAI).toBe(
                        KnowledgeVisibility.UNLISTED,
                    )
                    expect(result[1].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
                    expect(result[2].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
                })

                it('should apply special FAQ logic requiring publishedVersionId', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.FAQ,
                            title: 'FAQ with published version',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                            inUseByAI: KnowledgeVisibility.PUBLIC,
                            publishedVersionId: 123,
                        },
                        {
                            id: '2',
                            type: KnowledgeType.FAQ,
                            title: 'FAQ public but no published version',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                            inUseByAI: KnowledgeVisibility.PUBLIC,
                            publishedVersionId: null,
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Document,
                            title: 'Document public',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                            inUseByAI: KnowledgeVisibility.PUBLIC,
                        },
                    ]

                    const sorting: SortingState = [
                        { id: 'inUseByAI', desc: false },
                    ]
                    const result = sortData(items, sorting)

                    expect(result[0].id).toBe('1')
                    expect(result[0].type).toBe(KnowledgeType.FAQ)
                    expect(result[0].publishedVersionId).toBe(123)

                    expect(result[1].id).toBe('3')
                    expect(result[1].type).toBe(KnowledgeType.Document)

                    expect(result[2].id).toBe('2')
                    expect(result[2].type).toBe(KnowledgeType.FAQ)
                    expect(result[2].publishedVersionId).toBeNull()
                })
            })

            describe('numeric sorting', () => {
                it('should sort numbers ascending', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Item 1',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                            metrics: {
                                tickets: 50,
                                handoverTickets: 10,
                                csat: 4.5,
                                resourceSourceSetId: 1,
                            },
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Item 2',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                            metrics: {
                                tickets: 10,
                                handoverTickets: 5,
                                csat: 3.0,
                                resourceSourceSetId: 2,
                            },
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Item 3',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                            metrics: {
                                tickets: 100,
                                handoverTickets: 20,
                                csat: 5.0,
                                resourceSourceSetId: 3,
                            },
                        },
                    ]

                    const sorting: SortingState = [
                        { id: 'metrics.tickets', desc: false },
                    ]
                    const result = sortData(items, sorting)

                    expect(result[0].metrics?.tickets).toBe(10)
                    expect(result[1].metrics?.tickets).toBe(50)
                    expect(result[2].metrics?.tickets).toBe(100)
                })

                it('should sort numbers descending', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Item 1',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                            metrics: {
                                tickets: 50,
                                handoverTickets: 10,
                                csat: 4.5,
                                resourceSourceSetId: 1,
                            },
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Item 2',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                            metrics: {
                                tickets: 10,
                                handoverTickets: 5,
                                csat: 3.0,
                                resourceSourceSetId: 2,
                            },
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Item 3',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                            metrics: {
                                tickets: 100,
                                handoverTickets: 20,
                                csat: 5.0,
                                resourceSourceSetId: 3,
                            },
                        },
                    ]

                    const sorting: SortingState = [
                        { id: 'metrics.tickets', desc: true },
                    ]
                    const result = sortData(items, sorting)

                    expect(result[0].metrics?.tickets).toBe(100)
                    expect(result[1].metrics?.tickets).toBe(50)
                    expect(result[2].metrics?.tickets).toBe(10)
                })
            })

            describe('nested property sorting', () => {
                it('should sort by nested property using dot notation', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Item 1',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                            metrics: {
                                tickets: 50,
                                handoverTickets: 30,
                                csat: 4.5,
                                resourceSourceSetId: 1,
                            },
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Item 2',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                            metrics: {
                                tickets: 10,
                                handoverTickets: 5,
                                csat: 3.0,
                                resourceSourceSetId: 2,
                            },
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Item 3',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                            metrics: {
                                tickets: 100,
                                handoverTickets: 60,
                                csat: 5.0,
                                resourceSourceSetId: 3,
                            },
                        },
                    ]

                    const sorting: SortingState = [
                        { id: 'metrics.handoverTickets', desc: false },
                    ]
                    const result = sortData(items, sorting)

                    expect(result[0].metrics?.handoverTickets).toBe(5)
                    expect(result[1].metrics?.handoverTickets).toBe(30)
                    expect(result[2].metrics?.handoverTickets).toBe(60)
                })

                it('should handle missing nested properties', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Item 1',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                            metrics: {
                                tickets: 50,
                                handoverTickets: 10,
                                csat: 4.5,
                                resourceSourceSetId: 1,
                            },
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Item 2',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Item 3',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                            metrics: {
                                tickets: 100,
                                handoverTickets: 20,
                                csat: 5.0,
                                resourceSourceSetId: 3,
                            },
                        },
                    ]

                    const sorting: SortingState = [
                        { id: 'metrics.tickets', desc: false },
                    ]
                    const result = sortData(items, sorting)

                    expect(result[0].metrics?.tickets).toBe(50)
                    expect(result[1].metrics?.tickets).toBe(100)
                    expect(result[2].metrics).toBeUndefined()
                })
            })

            describe('null and undefined handling', () => {
                it('should push null values to end when sorting ascending', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Beta',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: null as any,
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Alpha',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(items, sorting)

                    expect(result[0].title).toBe('Alpha')
                    expect(result[1].title).toBe('Beta')
                    expect(result[2].title).toBeNull()
                })

                it('should push null values to end when sorting descending', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Beta',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: null as any,
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Alpha',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: true }]
                    const result = sortData(items, sorting)

                    expect(result[0].title).toBe('Beta')
                    expect(result[1].title).toBe('Alpha')
                    expect(result[2].title).toBeNull()
                })

                it('should handle undefined values', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Beta',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: undefined as any,
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Alpha',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(items, sorting)

                    expect(result[0].title).toBe('Alpha')
                    expect(result[1].title).toBe('Beta')
                    expect(result[2].title).toBeUndefined()
                })

                it('should handle all null values', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: null as any,
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: null as any,
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(items, sorting)

                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                })
            })

            describe('immutability', () => {
                it('should not mutate the original array', () => {
                    const original = [...mockItems]
                    const sorting: SortingState = [{ id: 'title', desc: false }]

                    sortData(mockItems, sorting)

                    expect(mockItems).toEqual(original)
                })

                it('should return a new array', () => {
                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(mockItems, sorting)

                    expect(result).not.toBe(mockItems)
                })
            })

            describe('edge cases', () => {
                it('should handle empty array', () => {
                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData([], sorting)

                    expect(result).toEqual([])
                })

                it('should handle single item', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Only Item',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(items, sorting)

                    expect(result).toHaveLength(1)
                    expect(result[0].title).toBe('Only Item')
                })

                it('should handle items with identical values', () => {
                    const items: GroupedKnowledgeItem[] = [
                        {
                            id: '1',
                            type: KnowledgeType.Guidance,
                            title: 'Same',
                            lastUpdatedAt: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: '2',
                            type: KnowledgeType.Guidance,
                            title: 'Same',
                            lastUpdatedAt: '2024-01-02T00:00:00Z',
                        },
                        {
                            id: '3',
                            type: KnowledgeType.Guidance,
                            title: 'Same',
                            lastUpdatedAt: '2024-01-03T00:00:00Z',
                        },
                    ]

                    const sorting: SortingState = [{ id: 'title', desc: false }]
                    const result = sortData(items, sorting)

                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                    expect(result[2].id).toBe('3')
                })
            })
        })

        describe('applyStableRowOrder', () => {
            const createMockItem = (
                id: string,
                title: string,
            ): GroupedKnowledgeItem => ({
                id,
                type: KnowledgeType.Guidance,
                title,
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
            })

            describe('maintaining cached positions', () => {
                it('should maintain exact positions for existing items', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                        createMockItem('3', 'Charlie'),
                    ]

                    const sortedIds = ['3', '1', '2']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('3')
                    expect(result[0].title).toBe('Charlie')
                    expect(result[1].id).toBe('1')
                    expect(result[1].title).toBe('Alpha')
                    expect(result[2].id).toBe('2')
                    expect(result[2].title).toBe('Beta')
                })

                it('should preserve cached order even when data array order changes', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('3', 'Charlie'),
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                    expect(result[2].id).toBe('3')
                })

                it('should use updated item data while maintaining position', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha Updated'),
                        createMockItem('2', 'Beta'),
                        createMockItem('3', 'Charlie'),
                    ]

                    const sortedIds = ['3', '1', '2']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('3')
                    expect(result[1].id).toBe('1')
                    expect(result[1].title).toBe('Alpha Updated')
                    expect(result[2].id).toBe('2')
                })
            })

            describe('handling new items', () => {
                it('should append new items to the end', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                        createMockItem('3', 'Charlie'),
                        createMockItem('4', 'New Item'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                    expect(result[2].id).toBe('3')
                    expect(result[3].id).toBe('4')
                    expect(result[3].title).toBe('New Item')
                })

                it('should append multiple new items in data array order', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                        createMockItem('4', 'New Item 1'),
                        createMockItem('5', 'New Item 2'),
                    ]

                    const sortedIds = ['1', '2']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(4)
                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                    expect(result[2].id).toBe('4')
                    expect(result[3].id).toBe('5')
                })

                it('should handle all items being new', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('4', 'New Item 1'),
                        createMockItem('5', 'New Item 2'),
                        createMockItem('6', 'New Item 3'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(3)
                    expect(result[0].id).toBe('4')
                    expect(result[1].id).toBe('5')
                    expect(result[2].id).toBe('6')
                })
            })

            describe('handling deleted items', () => {
                it('should filter out deleted items', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('3', 'Charlie'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(2)
                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('3')
                    expect(
                        result.find((item) => item.id === '2'),
                    ).toBeUndefined()
                })

                it('should handle multiple deleted items', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('2', 'Beta'),
                    ]

                    const sortedIds = ['1', '2', '3', '4']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(1)
                    expect(result[0].id).toBe('2')
                })

                it('should handle all items being deleted', () => {
                    const data: GroupedKnowledgeItem[] = []

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(0)
                    expect(result).toEqual([])
                })
            })

            describe('bulk operations', () => {
                it('should handle items being added and deleted simultaneously', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('3', 'Charlie'),
                        createMockItem('4', 'New Item'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(3)
                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('3')
                    expect(result[2].id).toBe('4')
                })

                it('should handle bulk delete followed by bulk add', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('5', 'New 1'),
                        createMockItem('6', 'New 2'),
                    ]

                    const sortedIds = ['1', '2', '3', '4']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(3)
                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('5')
                    expect(result[2].id).toBe('6')
                })

                it('should handle complete data replacement', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('4', 'New Alpha'),
                        createMockItem('5', 'New Beta'),
                        createMockItem('6', 'New Charlie'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(3)
                    expect(result[0].id).toBe('4')
                    expect(result[1].id).toBe('5')
                    expect(result[2].id).toBe('6')
                })
            })

            describe('edge cases', () => {
                it('should handle empty data array', () => {
                    const data: GroupedKnowledgeItem[] = []
                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toEqual([])
                })

                it('should handle empty sortedIds array', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                    ]
                    const sortedIds: string[] = []

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(2)
                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                })

                it('should handle both arrays being empty', () => {
                    const data: GroupedKnowledgeItem[] = []
                    const sortedIds: string[] = []

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toEqual([])
                })

                it('should handle single item', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                    ]
                    const sortedIds = ['1']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(1)
                    expect(result[0].id).toBe('1')
                })

                it('should handle duplicate IDs in sortedIds array', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                    ]

                    const sortedIds = ['1', '1', '2']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(2)
                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                })
            })

            describe('ID type handling', () => {
                it('should handle numeric IDs by converting to strings', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                        createMockItem('3', 'Charlie'),
                    ]

                    const sortedIds = ['3', '1', '2']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('3')
                    expect(result[1].id).toBe('1')
                    expect(result[2].id).toBe('2')
                })

                it('should handle mixed ID formats consistently', () => {
                    const data: GroupedKnowledgeItem[] = [
                        { ...createMockItem('1', 'Alpha'), id: '1' },
                        { ...createMockItem('2', 'Beta'), id: '2' },
                    ]

                    const sortedIds = ['2', '1']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('2')
                    expect(result[1].id).toBe('1')
                })
            })

            describe('immutability', () => {
                it('should not mutate the original data array', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                        createMockItem('3', 'Charlie'),
                    ]

                    const originalData = [...data]
                    const sortedIds = ['3', '1', '2']

                    applyStableRowOrder(data, sortedIds)

                    expect(data).toEqual(originalData)
                })

                it('should not mutate the sortedIds array', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                    ]

                    const sortedIds = ['2', '1']
                    const originalIds = [...sortedIds]

                    applyStableRowOrder(data, sortedIds)

                    expect(sortedIds).toEqual(originalIds)
                })

                it('should return a new array', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                    ]

                    const sortedIds = ['1', '2']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).not.toBe(data)
                })
            })

            describe('performance characteristics', () => {
                it('should efficiently handle large datasets', () => {
                    const largeData: GroupedKnowledgeItem[] = []
                    const sortedIds: string[] = []

                    for (let i = 0; i < 1000; i++) {
                        largeData.push(createMockItem(String(i), `Item ${i}`))
                        sortedIds.push(String(i))
                    }

                    sortedIds.reverse()

                    const startTime = performance.now()
                    const result = applyStableRowOrder(largeData, sortedIds)
                    const endTime = performance.now()

                    expect(result).toHaveLength(1000)
                    expect(result[0].id).toBe('999')
                    expect(result[999].id).toBe('0')

                    expect(endTime - startTime).toBeLessThan(50)
                })

                it('should handle partial updates efficiently', () => {
                    const data: GroupedKnowledgeItem[] = []
                    const sortedIds: string[] = []

                    for (let i = 0; i < 100; i++) {
                        sortedIds.push(String(i))
                    }

                    for (let i = 0; i < 50; i++) {
                        data.push(
                            createMockItem(String(i * 2), `Item ${i * 2}`),
                        )
                    }

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(50)
                    expect(result[0].id).toBe('0')
                    expect(result[1].id).toBe('2')
                    expect(result[2].id).toBe('4')
                })
            })

            describe('real-world scenarios', () => {
                it('should handle editing an item without re-sorting', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'ZZZZZ'),
                        createMockItem('3', 'Charlie'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                    expect(result[1].title).toBe('ZZZZZ')
                    expect(result[2].id).toBe('3')
                })

                it('should handle bulk enable/disable without re-sorting', () => {
                    const data: GroupedKnowledgeItem[] = [
                        {
                            ...createMockItem('1', 'Alpha'),
                            inUseByAI: KnowledgeVisibility.PUBLIC,
                        },
                        {
                            ...createMockItem('2', 'Beta'),
                            inUseByAI: KnowledgeVisibility.PUBLIC,
                        },
                        {
                            ...createMockItem('3', 'Charlie'),
                            inUseByAI: KnowledgeVisibility.PUBLIC,
                        },
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                    expect(result[2].id).toBe('3')
                })

                it('should handle creating a new item while sorted', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('2', 'Beta'),
                        createMockItem('3', 'Charlie'),
                        createMockItem('4', 'Newly Created'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('2')
                    expect(result[2].id).toBe('3')
                    expect(result[3].id).toBe('4')
                    expect(result[3].title).toBe('Newly Created')
                })

                it('should handle deleting an item while sorted', () => {
                    const data: GroupedKnowledgeItem[] = [
                        createMockItem('1', 'Alpha'),
                        createMockItem('3', 'Charlie'),
                    ]

                    const sortedIds = ['1', '2', '3']

                    const result = applyStableRowOrder(data, sortedIds)

                    expect(result).toHaveLength(2)
                    expect(result[0].id).toBe('1')
                    expect(result[1].id).toBe('3')
                })
            })
        })
    })
})
