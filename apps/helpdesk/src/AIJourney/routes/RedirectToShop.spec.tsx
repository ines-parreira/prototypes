import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { StaticRouter, useHistory } from 'react-router-dom'

import { appQueryClient } from 'api/queryClient'
import { ThemeProvider } from 'core/theme'
import { mockStore } from 'utils/testing'

import { RedirectToShop } from './RedirectToShop'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

const mockUseHistory = jest.mocked(useHistory)

const mockReplace = jest.fn()

type ShopifyIntegrationStub = { name: string }

const makeWrapper =
    (integrations: ShopifyIntegrationStub[] = []) =>
    ({ children }: { children: ReactNode }) => (
        <StaticRouter location="/app/ai-journey">
            <QueryClientProvider client={appQueryClient}>
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: integrations.map((s) => ({
                                type: 'shopify',
                                name: s.name,
                            })),
                        }),
                    })}
                >
                    <ThemeProvider>{children}</ThemeProvider>
                </Provider>
            </QueryClientProvider>
        </StaticRouter>
    )

const renderComponent = (
    basePath = '/app/ai-journey',
    integrations: ShopifyIntegrationStub[] = [],
) =>
    render(<RedirectToShop basePath={basePath} />, {
        wrapper: makeWrapper(integrations),
    })

describe('<RedirectToShop />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()

        mockUseHistory.mockReturnValue({
            replace: mockReplace,
        } as any)
    })

    it('should not redirect while loading', () => {
        renderComponent()

        expect(mockReplace).not.toHaveBeenCalled()
    })

    it('should redirect to first store alphabetically when no stored preference', () => {
        renderComponent('/app/ai-journey', [
            { name: 'store-b' },
            { name: 'store-a' },
        ])

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/store-a')
    })

    it('should use stored store when available in integrations', () => {
        localStorage.setItem(
            'ai-journey-last-selected-store',
            JSON.stringify('store-c'),
        )

        renderComponent('/app/ai-journey', [
            { name: 'store-a' },
            { name: 'store-b' },
            { name: 'store-c' },
        ])

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/store-c')
    })

    it('should fall back to first store when stored store no longer exists', () => {
        localStorage.setItem(
            'ai-journey-last-selected-store',
            JSON.stringify('deleted-store'),
        )

        renderComponent('/app/ai-journey', [
            { name: 'store-b' },
            { name: 'store-a' },
        ])

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/store-a')
    })

    it('should not redirect when no stores available', () => {
        renderComponent()

        expect(mockReplace).not.toHaveBeenCalled()
    })
})
