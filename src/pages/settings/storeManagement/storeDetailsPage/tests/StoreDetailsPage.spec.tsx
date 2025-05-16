import React from 'react'

import { screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { assumeMock, renderWithRouter } from 'utils/testing'

import StoreDetailsPage from '../StoreDetailsPage'

jest.mock('core/flags')

const mockUseFlag = assumeMock(useFlag)

describe('StoreDetailsPage', () => {
    beforeEach(() => {
        mockUseFlag.mockReset()
    })

    it('should render nothing when multi-store flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        const { container } = renderWithRouter(<StoreDetailsPage />)

        expect(container.firstChild).toBeNull()
    })

    it('should render page content when multi-store flag is enabled', () => {
        const storeId = '123'

        mockUseFlag.mockReturnValue(true)
        renderWithRouter(<StoreDetailsPage />, {
            path: '/app/settings/store-management/:id',
            route: `/app/settings/store-management/${storeId}`,
        })

        expect(
            screen.getByRole('heading', { name: 'Store Details' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Channels' })).toHaveAttribute(
            'href',
            `/app/settings/store-management/${storeId}/channels`,
        )
    })
})
