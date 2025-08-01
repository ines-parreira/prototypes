import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useFlag } from 'core/flags'

import { mockStoresWithAssignedChannels } from '../../fixtures'
import { StoreManagementProvider } from '../../StoreManagementProvider'
import * as StoreManagementProviderModule from '../../StoreManagementProvider'
import StoreManagementPage from '../StoreManagementPage'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('../../hooks/useStoresWithMaps', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockUseStoresWithMaps = require('../../hooks/useStoresWithMaps').default

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <MemoryRouter>
            <StoreManagementProvider>{component}</StoreManagementProvider>
        </MemoryRouter>,
    )
}

describe('StoreManagementPage', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        useFlagMock.mockImplementation(() => true)

        mockUseStoresWithMaps.mockReturnValue({
            enrichedStores: mockStoresWithAssignedChannels,
            unassignedChannels: [],
            refetchMapping: jest.fn(),
            refetchIntegrations: jest.fn(),
            isLoading: false,
        })
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
        useFlagMock.mockClear()
        jest.clearAllMocks()
    })

    it('should filter stores based on search input', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        renderWithProviders(<StoreManagementPage />)

        expect(screen.getByText('test-1')).toBeInTheDocument()
        expect(screen.getByText('test-2')).toBeInTheDocument()
        expect(screen.getByText('test-3')).toBeInTheDocument()

        const searchInput = screen.getByPlaceholderText('Search by store')

        await act(async () => {
            await user.type(searchInput, 'test-1')
            jest.advanceTimersByTime(500)
        })

        await waitFor(() => {
            expect(screen.getByText('test-1')).toBeInTheDocument()
            expect(screen.queryByText('test-2')).not.toBeInTheDocument()
            expect(screen.queryByText('test-3')).not.toBeInTheDocument()
        })
    })

    it('should show all stores when search input is cleared', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        renderWithProviders(<StoreManagementPage />)

        const searchInput = screen.getByPlaceholderText('Search by store')

        await act(async () => {
            await user.type(searchInput, 'test-1')
            jest.advanceTimersByTime(500)
        })

        await waitFor(() => {
            expect(screen.getByText('test-1')).toBeInTheDocument()
            expect(screen.queryByText('test-2')).not.toBeInTheDocument()
        })

        await user.clear(searchInput)

        await act(async () => {
            jest.advanceTimersByTime(500)
        })

        await waitFor(() => {
            expect(screen.getByText('test-1')).toBeInTheDocument()
            expect(screen.getByText('test-2')).toBeInTheDocument()
            expect(screen.getByText('test-3')).toBeInTheDocument()
        })
    })

    it('should show no results when search does not match any store', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        renderWithProviders(<StoreManagementPage />)

        const searchInput = screen.getByPlaceholderText('Search by store')

        await act(async () => {
            await user.type(searchInput, 'nonexistent-store')

            jest.advanceTimersByTime(500)
        })

        await waitFor(() => {
            expect(screen.queryByText('test-1')).not.toBeInTheDocument()
            expect(screen.queryByText('test-2')).not.toBeInTheDocument()
            expect(screen.queryByText('test-3')).not.toBeInTheDocument()
        })
    })

    it('should perform case-insensitive search', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        renderWithProviders(<StoreManagementPage />)

        const searchInput = screen.getByPlaceholderText('Search by store')

        await act(async () => {
            await user.type(searchInput, 'TEST-2')

            jest.advanceTimersByTime(500)
        })

        await waitFor(() => {
            expect(screen.queryByText('test-1')).not.toBeInTheDocument()
            expect(screen.getByText('test-2')).toBeInTheDocument()
            expect(screen.queryByText('test-3')).not.toBeInTheDocument()
        })
    })

    it('should render NoStoresPage when no stores are available', () => {
        const mockUseStoreManagementState = jest.spyOn(
            StoreManagementProviderModule,
            'useStoreManagementState',
        )
        mockUseStoreManagementState.mockReturnValue({
            stores: [],
            paginatedStores: [],
            currentPage: 1,
            setCurrentPage: jest.fn(),
            totalPages: 0,
            unassignedChannels: [],
            refetchMapping: jest.fn(),
            refetchIntegrations: jest.fn(),
            filter: '',
            setFilter: jest.fn(),
            sortOrder: 'asc' as const,
            setSortOrder: jest.fn(),
            isLoading: false,
        })

        render(
            <MemoryRouter>
                <StoreManagementPage />
            </MemoryRouter>,
        )

        expect(screen.getByText('Connect your first store')).toBeInTheDocument()

        mockUseStoreManagementState.mockRestore()
    })
})
