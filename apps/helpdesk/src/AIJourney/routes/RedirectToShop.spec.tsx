import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { StaticRouter, useHistory } from 'react-router-dom'

import { useIntegrations } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { ThemeProvider } from 'core/theme'
import { mockStore } from 'utils/testing'

import { RedirectToShop } from './index'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    ...jest.requireActual('AIJourney/providers'),
    useIntegrations: jest.fn(),
}))

const mockUseHistory = jest.mocked(useHistory)
const mockUseIntegrations = assumeMock(useIntegrations)

const mockReplace = jest.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
    <StaticRouter location="/app/ai-journey">
        <QueryClientProvider client={appQueryClient}>
            <Provider store={mockStore({})}>
                <ThemeProvider>{children}</ThemeProvider>
            </Provider>
        </QueryClientProvider>
    </StaticRouter>
)

const renderComponent = (basePath = '/app/ai-journey') =>
    render(<RedirectToShop basePath={basePath} />, { wrapper })

describe('<RedirectToShop />', () => {
    const mockIntegrations = [
        { id: 1, name: 'store-b', type: 'shopify' },
        { id: 2, name: 'store-a', type: 'shopify' },
        { id: 3, name: 'store-c', type: 'shopify' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()

        mockUseHistory.mockReturnValue({
            replace: mockReplace,
        } as any)

        mockUseIntegrations.mockReturnValue({
            integrations: mockIntegrations as any,
            isLoading: false,
            currentIntegration: undefined,
        })
    })

    it('should not redirect while loading', () => {
        mockUseIntegrations.mockReturnValue({
            integrations: [],
            isLoading: true,
            currentIntegration: undefined,
        })

        renderComponent()

        expect(mockReplace).not.toHaveBeenCalled()
    })

    it('should redirect to first store alphabetically when no stored preference', () => {
        renderComponent()

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/store-a')
    })

    it('should use stored store when available in integrations', () => {
        localStorage.setItem(
            'ai-journey-last-selected-store',
            JSON.stringify('store-c'),
        )

        renderComponent()

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/store-c')
    })

    it('should fall back to first store when stored store no longer exists', () => {
        localStorage.setItem(
            'ai-journey-last-selected-store',
            JSON.stringify('deleted-store'),
        )

        renderComponent()

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/store-a')
    })

    it('should not redirect when no stores available', () => {
        mockUseIntegrations.mockReturnValue({
            integrations: [],
            isLoading: false,
            currentIntegration: undefined,
        })

        renderComponent()

        expect(mockReplace).not.toHaveBeenCalled()
    })
})
