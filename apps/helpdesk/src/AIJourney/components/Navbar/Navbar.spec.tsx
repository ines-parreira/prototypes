import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'

import { appQueryClient } from 'api/queryClient'
import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { ThemeProvider } from 'core/theme'
import { mockStore } from 'utils/testing'

import { AiJourneyNavbar } from './Navbar'

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <StaticRouter location="/app/ai-agent/shopify/teststore1/optimize">
        <NavBarProvider>{children}</NavBarProvider>
    </StaticRouter>
)

const renderNavbar = () =>
    render(
        <QueryClientProvider client={appQueryClient}>
            <Provider store={mockStore({})}>
                <ThemeProvider>
                    <AiJourneyNavbar />
                </ThemeProvider>
            </Provider>
        </QueryClientProvider>,
        { wrapper },
    )

describe('<AiJourneyNavbar />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mocked(
            require('hooks/useAllIntegrations').default,
        ).mockReturnValue({
            integrations: [
                {
                    id: 1,
                    type: 'shopify',
                    name: 'teststore1',
                    meta: { shop_name: 'teststore1' },
                },
                {
                    id: 2,
                    type: 'shopify',
                    name: 'teststore2',
                    meta: { shop_name: 'teststore2' },
                },
                {
                    id: 3,
                    type: 'shopify',
                    name: 'teststore3',
                    meta: { shop_name: 'teststore3' },
                },
                {
                    id: 4,
                    type: 'shopify',
                    name: 'teststore4',
                    meta: { shop_name: 'teststore4' },
                },
            ],
        })
    })
    it('should render ai agent navbar with all options', async () => {
        renderNavbar()

        expect(screen.getByText('teststore1')).toBeInTheDocument()
        expect(screen.getByText('teststore2')).toBeInTheDocument()
        expect(screen.getByText('teststore3')).toBeInTheDocument()
        expect(screen.getByText('teststore4')).toBeInTheDocument()
    })
})
