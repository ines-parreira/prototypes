import type React from 'react'

import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import { IntegrationType } from 'models/integration/constants'

import { StoreIntegrationCell } from './StoreIntegrationCell'

jest.mock('state/integrations/helpers', () => ({
    getIconFromType: jest.fn(
        (type: string) => `https://example.com/icons/${type}.png`,
    ),
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

describe('StoreIntegrationCell', () => {
    it('should render "No store connected" when storeIntegration is undefined', () => {
        render(<StoreIntegrationCell storeIntegration={undefined} />)

        expect(screen.getByText('No store connected')).toBeInTheDocument()
    })

    it('should render store name and icon when storeIntegration is provided', () => {
        const storeIntegration = Map({
            type: IntegrationType.Shopify,
            name: 'my-test-shop',
        })

        render(<StoreIntegrationCell storeIntegration={storeIntegration} />)

        expect(screen.getByText('my-test-shop')).toBeInTheDocument()
        const icon = screen.getByRole('img', { hidden: true })
        expect(icon).toHaveAttribute(
            'src',
            'https://example.com/icons/shopify.png',
        )
    })

    it('should show warning icon and tooltip when store is disconnected', () => {
        const storeIntegration = Map({
            type: IntegrationType.Shopify,
            deactivated_datetime: '2024-01-01T00:00:00Z',
            name: 'disconnected-shop',
        })

        render(<StoreIntegrationCell storeIntegration={storeIntegration} />)

        expect(screen.getByText('disconnected-shop')).toBeInTheDocument()
        expect(screen.getByAltText('warning icon')).toBeInTheDocument()
        expect(
            screen.getByText('This store is currently disconnected'),
        ).toBeInTheDocument()
    })

    it('should not show warning icon when store is connected', () => {
        const storeIntegration = Map({
            type: IntegrationType.BigCommerce,
            name: 'connected-shop',
        })

        render(<StoreIntegrationCell storeIntegration={storeIntegration} />)

        expect(screen.getByText('connected-shop')).toBeInTheDocument()
        expect(screen.queryByAltText('warning icon')).not.toBeInTheDocument()
        expect(
            screen.queryByText('This store is currently disconnected'),
        ).not.toBeInTheDocument()
    })
})
