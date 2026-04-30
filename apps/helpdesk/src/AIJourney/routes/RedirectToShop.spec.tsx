import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { fromJS } from 'immutable'
import { StaticRouter, useHistory } from 'react-router-dom'

import { ThemeProvider } from 'core/theme'

import { RedirectToShop } from './RedirectToShop'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

const mockUseHistory = jest.mocked(useHistory)

const mockReplace = jest.fn()

type ShopifyIntegrationStub = { name: string }

const makeWrapper =
    () =>
    ({ children }: { children?: ReactNode }) => (
        <StaticRouter location="/app/ai-journey">
            <ThemeProvider>{children}</ThemeProvider>
        </StaticRouter>
    )

const renderComponent = (
    basePath = '/app/ai-journey',
    integrations: ShopifyIntegrationStub[] = [],
) =>
    render(<RedirectToShop basePath={basePath} />, {
        storeState: {
            integrations: fromJS({
                integrations: integrations.map((store) => ({
                    type: 'shopify',
                    name: store.name,
                })),
            }),
        },
        wrapper: makeWrapper(),
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
