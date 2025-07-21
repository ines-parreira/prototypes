import { render, screen } from '@testing-library/react'

import { IntegrationsProvider, useIntegrations } from './IntegrationsProvider'

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockUseAllIntegrations = require('hooks/useAllIntegrations').default

const TestComponent = () => {
    const { currentIntegration, integrations, isLoading } =
        useIntegrations('shopify-store')

    return (
        <div>
            <div data-testid="isLoading">
                {isLoading ? 'loading' : 'loaded'}
            </div>
            <div data-testid="integrations">
                {integrations.map((i) => i.name).join(',')}
            </div>
            <div data-testid="currentIntegration">
                {currentIntegration?.name}
            </div>
        </div>
    )
}

describe('<IntegrationsProvider />', () => {
    it('provides integrations and loading state', () => {
        mockUseAllIntegrations.mockReturnValue({
            integrations: [
                { id: 1, name: 'shopify-store', type: 'shopify' },
                { id: 2, name: 'other-store', type: 'shopify' },
            ],
            isLoading: false,
        })

        render(
            <IntegrationsProvider>
                <TestComponent />
            </IntegrationsProvider>,
        )

        expect(screen.getByTestId('isLoading')).toHaveTextContent('loaded')
        expect(screen.getByTestId('integrations')).toHaveTextContent(
            'shopify-store,other-store',
        )
        expect(screen.getByTestId('currentIntegration')).toHaveTextContent(
            'shopify-store',
        )
    })

    it('provides loading state', () => {
        mockUseAllIntegrations.mockReturnValue({
            integrations: [],
            isLoading: true,
        })

        render(
            <IntegrationsProvider>
                <TestComponent />
            </IntegrationsProvider>,
        )

        expect(screen.getByTestId('isLoading')).toHaveTextContent('loading')
        expect(screen.getByTestId('integrations')).toHaveTextContent('')
    })

    it('throws if used outside provider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
        const BrokenComponent = () => {
            useIntegrations()
            return null
        }
        expect(() => render(<BrokenComponent />)).toThrow(
            'useIntegrations must be used within IntegrationsProvider',
        )
        spy.mockRestore()
    })
})
