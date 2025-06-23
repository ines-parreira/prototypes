import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { HttpResponse, Integration } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithStore } from 'utils/testing'

import { StoreManagementProvider } from '../../StoreManagementProvider'
import ChannelsTab from '../Channels/ChannelsTab'
import useStoreGetter from '../General/hooks/useStoreGetter'
import StoreDetailsPage from '../StoreDetailsPage'

jest.mock('core/flags')
jest.mock('../Channels/ChannelsTab')
jest.mock('../General/hooks/useStoreGetter')

jest.mock('../../hooks/useStoresWithMaps', () => ({
    __esModule: true,
    default: () => ({
        enrichedStores: [
            {
                store: {
                    id: '123',
                    name: 'Test Store',
                    url: 'https://test-store.com',
                    type: 'shopify',
                    channels: [],
                },
            },
        ],
        unassignedChannels: [],
        refetchMapping: jest.fn(),
    }),
}))

const mockUseFlag = assumeMock(useFlag)
const mockChannelsTab = assumeMock(ChannelsTab)
const mockuseStoreGetter = assumeMock(useStoreGetter)

describe('StoreDetailsPage', () => {
    const { QueryClientProvider } = mockQueryClientProvider()

    beforeEach(() => {
        mockUseFlag.mockReset()
        mockChannelsTab.mockImplementation(() => <div>Mocked Channels Tab</div>)
        mockuseStoreGetter.mockReturnValue({
            isFetching: false,
            data: null,
            refetchStore: jest.fn(),
        })
    })

    it('should render nothing when multi-store flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        const { container } = renderWithStore(
            <MemoryRouter initialEntries={[`/settings/stores/1}`]}>
                <QueryClientProvider>
                    <StoreManagementProvider>
                        <Route path="/settings/stores/:id">
                            <StoreDetailsPage />
                        </Route>
                    </StoreManagementProvider>
                </QueryClientProvider>
            </MemoryRouter>,
            {},
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render page content when multi-store flag is enabled', async () => {
        const storeId = '123'

        mockUseFlag.mockReturnValue(true)
        renderWithStore(
            <MemoryRouter initialEntries={[`/settings/stores/${storeId}`]}>
                <QueryClientProvider>
                    <StoreManagementProvider>
                        <Route path="/settings/stores/:id">
                            <StoreDetailsPage />
                        </Route>
                    </StoreManagementProvider>
                </QueryClientProvider>
            </MemoryRouter>,
            {},
        )

        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: 'Channels' }),
            ).toHaveAttribute(
                'href',
                `/app/settings/store-management/${storeId}/channels`,
            )
        })
    })

    it('renders loader when fetching data', () => {
        mockUseFlag.mockReturnValue(true)
        ;(useStoreGetter as jest.Mock).mockReturnValue({
            isFetching: true,
            data: null,
            refetchStore: jest.fn(),
        })

        const storeId = '123'

        renderWithStore(
            <MemoryRouter
                initialEntries={[
                    `/app/settings/store-management/${storeId}/settings`,
                ]}
            >
                <QueryClientProvider>
                    <StoreManagementProvider>
                        <Route path="/app/settings/store-management/:id">
                            <StoreDetailsPage />
                        </Route>
                    </StoreManagementProvider>
                </QueryClientProvider>
            </MemoryRouter>,
            {},
        )

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render breadcrumbs with Store Management link and store name', () => {
        const storeId = '123'
        const storeName = 'My Test Store'

        mockUseFlag.mockReturnValue(true)
        mockuseStoreGetter.mockReturnValue({
            isFetching: false,
            data: {
                data: {
                    id: storeId,
                    name: storeName,
                    type: 'shopify',
                    meta: {},
                },
            } as unknown as HttpResponse<Integration>,
            refetchStore: jest.fn(),
        })

        renderWithStore(
            <MemoryRouter
                initialEntries={[`/app/settings/store-management/${storeId}`]}
            >
                <QueryClientProvider>
                    <StoreManagementProvider>
                        <Route path="/app/settings/store-management/:id">
                            <StoreDetailsPage />
                        </Route>
                    </StoreManagementProvider>
                </QueryClientProvider>
            </MemoryRouter>,
            {},
        )

        expect(
            screen.getByRole('navigation', { name: 'breadcrumb' }),
        ).toBeInTheDocument()

        const storeManagementLink = screen.getByText('Store Management')
        expect(storeManagementLink.closest('a')).toHaveAttribute(
            'to',
            '/app/settings/store-management',
        )

        expect(screen.getByText(storeName)).toBeInTheDocument()
    })
})
