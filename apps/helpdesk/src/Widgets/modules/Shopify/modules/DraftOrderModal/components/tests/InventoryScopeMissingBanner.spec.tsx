import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import { InventoryScopeMissingBanner } from '../InventoryScopeMissingBanner'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('hooks/useAppSelector')

const mockUseFlags = useFlags as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('InventoryScopeMissingBanner', () => {
    const getRedirectUriMock = () =>
        'https://example.com/auth?shop_name={shop_name}'

    const storeIntegrationNeedsScopeUpdate = {
        meta: {
            shop_name: 'test-shop',
            need_scope_update: true,
            oauth: {
                scope: ['read_products'],
            },
        },
    }

    const storeIntegrationWithoutScopeUpdate = {
        meta: {
            shop_name: 'test-shop2',
            need_scope_update: false,
            oauth: {
                scope: ['read_products'],
            },
        },
    }

    const storeIntegrationNeedsOtherScopeUpdate = {
        meta: {
            shop_name: 'test-shop3',
            need_scope_update: true,
            oauth: {
                scope: ['read_products', 'read_inventory'],
            },
        },
    }

    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ShopifyInventoryItemScopeBanner]: true,
        })
    })

    const mockStoreData = (storeData: any) => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === makeGetRedirectUri) return getRedirectUriMock
            return storeData as unknown
        })
    }

    it('renders banner when feature flag is enabled and inventory scope is missing', () => {
        mockStoreData(storeIntegrationNeedsScopeUpdate)

        render(<InventoryScopeMissingBanner integrationId={1} />)

        expect(
            screen.getByText(/The inventory tracking might be outdated/),
        ).toBeInTheDocument()
        expect(screen.getByText('test-shop')).toBeInTheDocument()
        expect(screen.getByText('Update Permissions')).toHaveAttribute(
            'href',
            'https://example.com/auth?shop_name=test-shop',
        )
    })

    it('does not render when feature flag is disabled', () => {
        mockStoreData(storeIntegrationNeedsScopeUpdate)
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ShopifyInventoryItemScopeBanner]: false,
        })

        const { container } = render(
            <InventoryScopeMissingBanner integrationId={1} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('does not render when need_scope_update is false', () => {
        mockStoreData(storeIntegrationWithoutScopeUpdate)

        const { container } = render(
            <InventoryScopeMissingBanner integrationId={1} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('does not render when inventory scope is already present', () => {
        mockStoreData(storeIntegrationNeedsOtherScopeUpdate)

        const { container } = render(
            <InventoryScopeMissingBanner integrationId={1} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('handles undefined shop integration gracefully', () => {
        mockStoreData(undefined)

        const { container } = render(
            <InventoryScopeMissingBanner integrationId={1} />,
        )
        expect(container).toBeEmptyDOMElement()
    })
})
