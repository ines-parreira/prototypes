import { useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import type { HttpResponse, Integration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/types'

import { StoreManagementProvider } from '../../StoreManagementProvider'
import { ChannelsTab } from '../Channels/ChannelsTab'
import { useStoreGetter } from '../General/hooks/useStoreGetter'
import { StoreDetailsPage } from '../StoreDetailsPage'

jest.mock('@repo/feature-flags')
jest.mock('../Channels/ChannelsTab')
jest.mock('../General/hooks/useStoreGetter')
jest.mock('../../hooks/useStoresWithMaps', () => ({
    __esModule: true,
    useStoresWithMaps: () => ({
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
const mockChannelsTab = assumeMock(ChannelsTab)
const mockuseStoreGetter = assumeMock(useStoreGetter)
const mockUseFlag = assumeMock(useFlag)
describe('StoreDetailsPage', () => {
    beforeEach(() => {
        mockChannelsTab.mockImplementation(() => <div>Mocked Channels Tab</div>)
        mockuseStoreGetter.mockReturnValue({
            isFetching: false,
            data: null,
            refetchStore: jest.fn(),
        })
        mockUseFlag.mockReturnValue(false)
    })
    it('should render page content', async () => {
        const storeId = '123'
        render(
            <StoreManagementProvider>
                <StoreDetailsPage />
            </StoreManagementProvider>,
            {
                storeState: {},
                path: '/settings/stores/:id',
                initialEntries: [`/settings/stores/${storeId}`],
            },
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
        ;(useStoreGetter as jest.Mock).mockReturnValue({
            isFetching: true,
            data: null,
            refetchStore: jest.fn(),
        })
        const storeId = '123'
        render(
            <StoreManagementProvider>
                <StoreDetailsPage />
            </StoreManagementProvider>,
            {
                storeState: {},
                path: '/app/settings/store-management/:id',
                initialEntries: [
                    `/app/settings/store-management/${storeId}/settings`,
                ],
            },
        )
        expect(screen.getByRole('status')).toBeInTheDocument()
    })
    it('should render breadcrumbs with Store Management link and store name', () => {
        const storeId = '123'
        const storeName = 'My Test Store'
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
        render(
            <StoreManagementProvider>
                <StoreDetailsPage />
            </StoreManagementProvider>,
            {
                storeState: {},
                path: '/app/settings/store-management/:id',
                initialEntries: [`/app/settings/store-management/${storeId}`],
            },
        )
        expect(
            screen.getByRole('navigation', { name: 'breadcrumb' }),
        ).toBeInTheDocument()
        const storeManagementLink = screen.getByText('Store Management')
        expect(storeManagementLink.closest('a')).toHaveAttribute(
            'href',
            '/app/settings/store-management',
        )
        expect(screen.getByText(storeName)).toBeInTheDocument()
    })
    describe('Shopify Metafields navigation link', () => {
        it('should render Shopify Metafields link when feature flag is enabled and store is Shopify', () => {
            const storeId = '123'
            mockUseFlag.mockReturnValue(true)
            mockuseStoreGetter.mockReturnValue({
                isFetching: false,
                data: {
                    data: {
                        id: storeId,
                        name: 'Shopify Store',
                        type: IntegrationType.Shopify,
                        meta: {},
                    },
                } as unknown as HttpResponse<Integration>,
                refetchStore: jest.fn(),
            })
            render(
                <StoreManagementProvider>
                    <StoreDetailsPage />
                </StoreManagementProvider>,
                {
                    storeState: {},
                    path: '/app/settings/store-management/:id',
                    initialEntries: [
                        `/app/settings/store-management/${storeId}`,
                    ],
                },
            )
            const metafieldsLink = screen.getByRole('link', {
                name: 'Shopify Metafields',
            })
            expect(metafieldsLink).toBeInTheDocument()
            expect(metafieldsLink).toHaveAttribute(
                'href',
                `/app/settings/store-management/${storeId}/metafields`,
            )
        })
        it('should not render Shopify Metafields link when feature flag is disabled', () => {
            const storeId = '123'
            mockUseFlag.mockReturnValue(false)
            mockuseStoreGetter.mockReturnValue({
                isFetching: false,
                data: {
                    data: {
                        id: storeId,
                        name: 'Shopify Store',
                        type: IntegrationType.Shopify,
                        meta: {},
                    },
                } as unknown as HttpResponse<Integration>,
                refetchStore: jest.fn(),
            })
            render(
                <StoreManagementProvider>
                    <StoreDetailsPage />
                </StoreManagementProvider>,
                {
                    storeState: {},
                    path: '/app/settings/store-management/:id',
                    initialEntries: [
                        `/app/settings/store-management/${storeId}`,
                    ],
                },
            )
            expect(
                screen.queryByRole('link', { name: 'Shopify Metafields' }),
            ).not.toBeInTheDocument()
        })
        it('should not render Shopify Metafields link for non-Shopify stores', () => {
            const storeId = '123'
            mockUseFlag.mockReturnValue(true)
            mockuseStoreGetter.mockReturnValue({
                isFetching: false,
                data: {
                    data: {
                        id: storeId,
                        name: 'BigCommerce Store',
                        type: 'bigcommerce' as any,
                        meta: {},
                    },
                } as unknown as HttpResponse<Integration>,
                refetchStore: jest.fn(),
            })
            render(
                <StoreManagementProvider>
                    <StoreDetailsPage />
                </StoreManagementProvider>,
                {
                    storeState: {},
                    path: '/app/settings/store-management/:id',
                    initialEntries: [
                        `/app/settings/store-management/${storeId}`,
                    ],
                },
            )
            expect(
                screen.queryByRole('link', { name: 'Shopify Metafields' }),
            ).not.toBeInTheDocument()
        })
        it('should not render Shopify Metafields link when store data is not available', () => {
            const storeId = '123'
            mockUseFlag.mockReturnValue(true)
            mockuseStoreGetter.mockReturnValue({
                isFetching: false,
                data: null,
                refetchStore: jest.fn(),
            })
            render(
                <StoreManagementProvider>
                    <StoreDetailsPage />
                </StoreManagementProvider>,
                {
                    storeState: {},
                    path: '/app/settings/store-management/:id',
                    initialEntries: [
                        `/app/settings/store-management/${storeId}`,
                    ],
                },
            )
            expect(
                screen.queryByRole('link', { name: 'Shopify Metafields' }),
            ).not.toBeInTheDocument()
        })
    })
})
