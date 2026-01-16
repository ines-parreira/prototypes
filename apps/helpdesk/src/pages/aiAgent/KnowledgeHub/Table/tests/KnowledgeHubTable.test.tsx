import '@testing-library/jest-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { user } from 'fixtures/users'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import type {
    GroupedKnowledgeItem,
    KnowledgeItem,
} from 'pages/aiAgent/KnowledgeHub/types'

import { KnowledgeHubTable } from '../KnowledgeHubTable'

const mockStore = configureMockStore()
const defaultState = {
    currentUser: Map(user),
    integrations: fromJS({
        integrations: [],
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

describe('KnowledgeHubTable - Selection Reset', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
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
            await act(() => user.click(firstCheckbox))
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
            await act(() => user.click(firstCheckbox))
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
            await act(() => user.click(firstCheckbox))
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

        const { rerender } = renderComponent({ selectedFolder: snippetFolder })

        const checkboxes = screen.getAllByRole('checkbox')
        const firstCheckbox = checkboxes.find(
            (cb) => cb.getAttribute('aria-label') !== 'Select all rows',
        )

        if (firstCheckbox) {
            await act(() => user.click(firstCheckbox))
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
