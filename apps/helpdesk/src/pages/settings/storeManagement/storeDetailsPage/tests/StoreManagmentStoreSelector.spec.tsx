import React from 'react'

import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mockStoresWithAssignedChannels } from '../../fixtures'
import { useStoreManagementState } from '../../StoreManagementProvider'
import StoreManagementStoreSelector from '../StoreManagmentStoreSelector'

const mockHistoryReplace = jest.fn()

jest.mock('react-router-dom', () => {
    const mockUseLocation = jest.fn()
    const mockUseParams = jest.fn()

    return {
        useHistory: () => ({
            replace: mockHistoryReplace,
        }),
        useLocation: mockUseLocation,
        useParams: mockUseParams,
    }
})

const mockUseLocation = require('react-router-dom')
    .useLocation as jest.MockedFunction<any>
const mockUseParams = require('react-router-dom')
    .useParams as jest.MockedFunction<any>

jest.mock('../../StoreManagementProvider')

const mockUseStoreManagementState =
    useStoreManagementState as jest.MockedFunction<
        typeof useStoreManagementState
    >

const mockStores = mockStoresWithAssignedChannels

const defaultMockContext = {
    stores: mockStores,
    unassignedChannels: [],
    refetchMapping: jest.fn(),
    refetchIntegrations: jest.fn(),
    paginatedStores: [],
    currentPage: 1,
    setCurrentPage: jest.fn(),
    totalPages: 1,
    isLoading: false,
    filter: '',
    setFilter: jest.fn(),
    sortOrder: 'asc' as const,
    setSortOrder: jest.fn(),
}

describe('StoreManagementStoreSelector', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseLocation.mockReturnValue({
            pathname: '/app/settings/store-management/1/general',
        })
        mockUseParams.mockReturnValue({
            id: '1',
        })
        mockUseStoreManagementState.mockReturnValue(defaultMockContext)
    })
    it('shows dropdown with all stores when clicked', async () => {
        const user = userEvent.setup()
        render(<StoreManagementStoreSelector />)

        const dropdownButton = screen.getByRole('button')
        await act(async () => {
            await user.click(dropdownButton)
        })

        const dropdownOptions = screen.getAllByRole('option')
        expect(dropdownOptions).toHaveLength(3)

        expect(
            dropdownOptions.find((o) => o.textContent?.includes('test-1')),
        ).toBeDefined()
        expect(
            dropdownOptions.find((o) => o.textContent?.includes('test-2')),
        ).toBeDefined()
        expect(
            dropdownOptions.find((o) => o.textContent?.includes('test-3')),
        ).toBeDefined()
    })

    it('navigates to selected store when dropdown item is clicked', async () => {
        const user = userEvent.setup()
        render(<StoreManagementStoreSelector />)

        const dropdownButton = screen.getByRole('button')

        await act(async () => {
            await user.click(dropdownButton)
        })

        const dropdownOptions = screen.getAllByRole('option')
        const test2Option = dropdownOptions.find((option) =>
            option.textContent?.includes('test-2'),
        )

        expect(test2Option).toBeDefined()

        await act(async () => {
            await user.click(test2Option!)
        })

        expect(mockHistoryReplace).toHaveBeenCalledWith(
            '/app/settings/store-management/2/general',
        )
    })

    it('preserves sub-routes when changing store', async () => {
        const user = userEvent.setup()
        mockUseLocation.mockReturnValue({
            pathname: '/app/settings/store-management/1/channels',
        })

        render(<StoreManagementStoreSelector />)

        const dropdownButton = screen.getByRole('button')

        await act(async () => {
            await user.click(dropdownButton)
        })

        const dropdownOptions = screen.getAllByRole('option')
        const test3Option = dropdownOptions.find((option) =>
            option.textContent?.includes('test-3'),
        )

        expect(test3Option).toBeDefined()

        await act(async () => {
            await user.click(test3Option!)
        })

        expect(mockHistoryReplace).toHaveBeenCalledWith(
            '/app/settings/store-management/3/channels',
        )
    })

    it('does not render when no selected store is found', () => {
        mockUseParams.mockReturnValue({ id: '999' })

        const { container } = render(<StoreManagementStoreSelector />)

        expect(container.firstChild).toBeNull()
    })

    it('does not render when stores array is empty', () => {
        mockUseStoreManagementState.mockReturnValue({
            ...defaultMockContext,
            stores: [],
        })

        const { container } = render(<StoreManagementStoreSelector />)

        expect(container.firstChild).toBeNull()
    })

    it('finds and displays the correct selected store based on URL param', () => {
        mockUseParams.mockReturnValue({ id: '2' })

        render(<StoreManagementStoreSelector />)

        const button = screen.getByRole('button')
        expect(within(button).getByText('test-2')).toBeInTheDocument()
    })
})
