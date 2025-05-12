import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { storeMappingFixture } from '../fixtures'
import { StoreManagementProvider } from '../StoreManagementProvider'
import { StoreManagementTable } from '../storeManagementTable/storeManagementTable'
import { Store } from '../types'

jest.mock('../StoreManagementProvider', () => ({
    useStoreManagementState: jest.fn(),
    StoreManagementProvider: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

describe('StoreManagementTable', () => {
    const mockStores: Store[] = storeMappingFixture

    const mockState = {
        currentPage: 1,
        totalPages: 2,
        paginatedStores: mockStores,
        setCurrentPage: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        const {
            useStoreManagementState,
        } = require('../StoreManagementProvider')
        useStoreManagementState.mockReturnValue(mockState)
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
            expect(screen.getByText(store.name)).toBeInTheDocument()
            expect(screen.getByText(store.url)).toBeInTheDocument()
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
        const {
            useStoreManagementState,
        } = require('../StoreManagementProvider')
        useStoreManagementState.mockReturnValue({
            currentPage: 1,
            paginatedStores: [],
            setCurrentPage: jest.fn(),
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
})
