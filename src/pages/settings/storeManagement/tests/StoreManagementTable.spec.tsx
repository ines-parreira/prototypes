import React from 'react'

import { render, screen } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

import { mockStoresWithAssignedChannels } from '../fixtures'
import {
    StoreManagementProvider,
    useStoreManagementState,
} from '../StoreManagementProvider'
import { StoreManagementTable } from '../storeManagementTable/storeManagementTable'

jest.mock('../StoreManagementProvider', () => ({
    useStoreManagementState: jest.fn(),
    StoreManagementProvider: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

const mockUseStoreManagementState = jest.mocked(useStoreManagementState)

describe('StoreManagementTable', () => {
    const mockStores = mockStoresWithAssignedChannels

    const mockState = {
        stores: mockStores,
        unassignedChannels: [],
        refetchMapping: jest.fn(),
        refetchIntegrations: jest.fn(),
        currentPage: 1,
        totalPages: 2,
        paginatedStores: mockStores,
        setCurrentPage: jest.fn(),
        isLoading: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreManagementState.mockReturnValue(mockState)
    })

    it('renders table headers correctly', () => {
        render(
            <StoreManagementProvider>
                <StoreManagementTable />
            </StoreManagementProvider>,
        )

        expect(screen.getByText('STORE NAME')).toBeInTheDocument()
        expect(screen.getByText('STORE URL')).toBeInTheDocument()
        expect(screen.getByText('CHANNELS')).toBeInTheDocument()
    })

    it('renders all store rows correctly', () => {
        render(
            <StoreManagementProvider>
                <StoreManagementTable />
            </StoreManagementProvider>,
        )

        mockStores.forEach((store) => {
            expect(screen.getByText(store.store.name)).toBeInTheDocument()
            expect(screen.getByText(store.store.uri)).toBeInTheDocument()
        })
    })

    it('renders pagination when there are multiple pages', () => {
        render(
            <StoreManagementProvider>
                <StoreManagementTable />
            </StoreManagementProvider>,
        )

        expect(screen.getByLabelText('page-1')).toBeInTheDocument()
        expect(screen.getByLabelText('page-2')).toBeInTheDocument()
    })

    it('does not render pagination when there is only one page', () => {
        mockUseStoreManagementState.mockReturnValue({
            ...mockState,
            currentPage: 1,
            paginatedStores: [],
            totalPages: 1,
        })

        render(
            <StoreManagementProvider>
                <StoreManagementTable />
            </StoreManagementProvider>,
        )

        expect(screen.queryByText('page-1')).not.toBeInTheDocument()
    })

    it('calls setCurrentPage when pagination is clicked', async () => {
        render(
            <StoreManagementProvider>
                <StoreManagementTable />
            </StoreManagementProvider>,
        )

        const nextPageButton = screen.getByLabelText('page-2')
        await userEvent.click(nextPageButton)

        expect(mockState.setCurrentPage).toHaveBeenCalledWith(2)
    })

    it('renders loader when isLoading is true', () => {
        mockUseStoreManagementState.mockReturnValue({
            ...mockState,
            isLoading: true,
        })

        render(
            <StoreManagementProvider>
                <StoreManagementTable />
            </StoreManagementProvider>,
        )

        expect(screen.getByRole('status')).toBeInTheDocument()
    })
})
