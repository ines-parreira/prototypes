import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { StaticRouter, useHistory, useLocation } from 'react-router-dom'

import { appQueryClient } from 'api/queryClient'
import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { ThemeProvider } from 'core/theme'
import { account } from 'fixtures/account'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { mockStore } from 'utils/testing'

import { AiJourneyNavbar } from './Navbar'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

const mockUseHistory = jest.mocked(useHistory)
const mockUseLocation = jest.mocked(useLocation)
const mockUseStoreActivations = jest.mocked(useStoreActivations)
const mockPush = jest.fn()
const mockReplace = jest.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
    <StaticRouter location="/app/ai-journey/teststore1">
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
    const user = userEvent.setup()

    const mockStoreIntegrations = [
        {
            id: 1,
            name: 'teststore1',
            type: 'shopify',
            meta: {
                shop_name: 'teststore1',
            },
        },
        {
            id: 2,
            name: 'teststore2',
            type: 'shopify',
            meta: {
                shop_name: 'teststore2',
            },
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return mockStoreIntegrations
            }
            if (selector.name === 'getCurrentAccountState') {
                return fromJS(account)
            }
            return []
        })

        mockUseStoreActivations.mockReturnValue({
            storeActivations: {},
        } as ReturnType<typeof useStoreActivations>)

        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-journey/teststore1',
        } as any)

        mockUseHistory.mockReturnValue({
            push: mockPush,
            replace: mockReplace,
        } as any)
    })
    it('should render ai agent navbar with first store selected', async () => {
        renderNavbar()

        expect(screen.getByText('teststore1')).toBeInTheDocument()
        expect(screen.queryByText('teststore2')).not.toBeInTheDocument()
    })

    it('should open dropdown when clicking in selected store', async () => {
        renderNavbar()

        await act(async () => {
            await user.click(screen.getByText('teststore1'))
        })
        expect(screen.getByText('teststore2')).toBeInTheDocument()
    })

    it('should navigate to selected store when onChange is triggered', async () => {
        renderNavbar()

        await act(async () => {
            await user.click(screen.getByText('teststore1'))
        })

        await act(async () => {
            await user.click(screen.getByText('teststore2'))
        })

        expect(mockPush).toHaveBeenCalledWith('/app/ai-journey/teststore2')
    })

    it('should redirect to first store when no shopName in URL and stores exist', async () => {
        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-journey',
        } as any)

        renderNavbar()

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/teststore1')
        expect(screen.getByText('teststore1')).toBeInTheDocument()
    })
})
