import React from 'react'

import { screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { StoreManagementProvider } from '../../StoreManagementProvider'
import ChannelsTab from '../Channels/ChannelsTab'
import StoreDetailsPage from '../StoreDetailsPage'

jest.mock('core/flags')
jest.mock('../Channels/ChannelsTab')
jest.mock('../../hooks/useStoresWithMaps', () => ({
    __esModule: true,
    default: () => ({
        enrichedStores: [
            {
                id: '123',
                name: 'Test Store',
                url: 'https://test-store.com',
                type: 'shopify',
                channels: [],
            },
        ],
        unassignedChannels: [],
        refetchMapping: jest.fn(),
    }),
}))

const mockUseFlag = assumeMock(useFlag)
const mockChannelsTab = assumeMock(ChannelsTab)

describe('StoreDetailsPage', () => {
    beforeEach(() => {
        mockUseFlag.mockReset()
        mockChannelsTab.mockImplementation(() => <div>Mocked Channels Tab</div>)
    })

    it('should render nothing when multi-store flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        const { container } = renderWithRouter(<StoreDetailsPage />)

        expect(container.firstChild).toBeNull()
    })

    it('should render page content when multi-store flag is enabled', () => {
        const storeId = '123'

        mockUseFlag.mockReturnValue(true)
        renderWithRouter(
            <StoreManagementProvider>
                <StoreDetailsPage />
            </StoreManagementProvider>,
            {
                path: '/app/settings/store-management/:id',
                route: `/app/settings/store-management/${storeId}`,
            },
        )

        expect(
            screen.getByRole('heading', { name: 'Store Details' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Channels' })).toHaveAttribute(
            'href',
            `/app/settings/store-management/${storeId}/channels`,
        )
        expect(mockChannelsTab).toHaveBeenCalledWith({ storeId }, {})
    })
})
