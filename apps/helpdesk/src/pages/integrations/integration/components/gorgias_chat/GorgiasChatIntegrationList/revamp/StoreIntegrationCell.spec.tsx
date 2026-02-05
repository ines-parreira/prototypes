import type React from 'react'

import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import { IconName } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'

import { StoreIntegrationCell } from './StoreIntegrationCell'

jest.mock('state/integrations/helpers', () => ({
    getStoreIconNameFromType: jest.fn((type: string) => {
        if (type === IntegrationType.Shopify) {
            return IconName.VendorShopifyColored
        }
        return IconName.VendorBicommerceColored
    }),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

const mockChat = Map({
    id: 'test-chat-id',
})

describe('StoreIntegrationCell', () => {
    it('should render "Connect store" button when storeIntegration is undefined', () => {
        render(
            <StoreIntegrationCell
                storeIntegration={undefined}
                chat={mockChat}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Connect store' }),
        ).toBeInTheDocument()
    })

    it('should render store name when storeIntegration is provided', () => {
        const storeIntegration = Map({
            type: IntegrationType.Shopify,
            name: 'my-test-shop',
        })

        render(
            <StoreIntegrationCell
                storeIntegration={storeIntegration}
                chat={mockChat}
            />,
        )

        expect(screen.getByText('my-test-shop')).toBeInTheDocument()
    })

    it('should show warning tooltip when store is disconnected', () => {
        const storeIntegration = Map({
            type: IntegrationType.Shopify,
            deactivated_datetime: '2024-01-01T00:00:00Z',
            name: 'disconnected-shop',
        })

        render(
            <StoreIntegrationCell
                storeIntegration={storeIntegration}
                chat={mockChat}
            />,
        )

        expect(screen.getByText('disconnected-shop')).toBeInTheDocument()
        expect(
            screen.getByText('This store is currently disconnected'),
        ).toBeInTheDocument()
    })

    it('should not show warning when store is connected', () => {
        const storeIntegration = Map({
            type: IntegrationType.BigCommerce,
            name: 'connected-shop',
        })

        render(
            <StoreIntegrationCell
                storeIntegration={storeIntegration}
                chat={mockChat}
            />,
        )

        expect(screen.getByText('connected-shop')).toBeInTheDocument()
        expect(
            screen.queryByText('This store is currently disconnected'),
        ).not.toBeInTheDocument()
    })
})
