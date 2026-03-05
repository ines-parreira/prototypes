import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { StaticRouter, useHistory, useParams } from 'react-router-dom'

import { useLastSelectedStore } from 'AIJourney/hooks'
import { JourneyProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { ThemeProvider } from 'core/theme'
import { account } from 'fixtures/account'
import useAppSelector from 'hooks/useAppSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { mockStore } from 'utils/testing'

import { AiJourneyNavbar } from './Navbar'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
    useParams: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useLastSelectedStore: jest.fn(),
}))
const mockUseLastSelectedStore = assumeMock(useLastSelectedStore)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
    useFlag: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

const mockUseHistory = jest.mocked(useHistory)
const mockUseParams = jest.mocked(useParams)
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockSetLastSelectedStore = jest.fn()
const mockToggleCollapse = jest.fn()

const mockUseFlag = useFlag as jest.Mock

const renderNavbar = (
    location = '/app/ai-journey/teststore1',
    isCollapsed = false,
) =>
    render(
        <QueryClientProvider client={appQueryClient}>
            <Provider store={mockStore({})}>
                <ThemeProvider>
                    <SidebarContext.Provider
                        value={{
                            isCollapsed,
                            toggleCollapse: mockToggleCollapse,
                        }}
                    >
                        <AiJourneyNavbar />
                    </SidebarContext.Provider>
                </ThemeProvider>
            </Provider>
        </QueryClientProvider>,
        {
            wrapper: ({ children }: { children: ReactNode }) => (
                <StaticRouter location={location}>
                    <NavBarProvider>{children}</NavBarProvider>
                </StaticRouter>
            ),
        },
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

        mockUseHistory.mockReturnValue({
            push: mockPush,
            replace: mockReplace,
        } as any)

        mockUseLastSelectedStore.mockReturnValue({
            setLastSelectedStore: mockSetLastSelectedStore,
            resolveStore: (storeNames: string[]) => storeNames[0],
        })
        mockUseParams.mockReturnValue({
            shopName: undefined as unknown as string,
        })
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
        renderNavbar('/app/ai-journey')

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/teststore1')
    })

    describe('localStorage persistence', () => {
        it('should use stored store when no shopName in URL and stored store exists', async () => {
            mockUseLastSelectedStore.mockReturnValue({
                setLastSelectedStore: mockSetLastSelectedStore,
                resolveStore: (storeNames: string[]) =>
                    storeNames.includes('teststore2')
                        ? 'teststore2'
                        : storeNames[0],
            })

            renderNavbar('/app/ai-journey')

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore2',
            )
        })

        it('should fall back to first store when stored store no longer exists', async () => {
            mockUseLastSelectedStore.mockReturnValue({
                setLastSelectedStore: mockSetLastSelectedStore,
                resolveStore: (storeNames: string[]) => storeNames[0],
            })

            renderNavbar('/app/ai-journey')

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
        })

        it('should save selected store to localStorage when changing store', async () => {
            renderNavbar()

            await user.click(screen.getByText('teststore1'))
            await user.click(screen.getByText('teststore2'))

            expect(mockSetLastSelectedStore).toHaveBeenCalledWith('teststore2')
        })

        it('should save store to localStorage when URL has shopName', async () => {
            renderNavbar('/app/ai-journey/teststore2')

            expect(mockSetLastSelectedStore).toHaveBeenCalledWith('teststore2')
        })
    })

    describe('Analytics section', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyAnalyticsEnabled) {
                    return true
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })
        })

        it('should render analytics section ', async () => {
            renderNavbar('/app/ai-journey')

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Analytics')).toBeInTheDocument()
        })

        it('should not render analytics section when feature flag is disabled', async () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyAnalyticsEnabled) {
                    return false
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })

            renderNavbar('/app/ai-journey')

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Analytics')).not.toBeInTheDocument()
        })
    })

    describe('Playground section', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyPlaygroundEnabled) {
                    return true
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })
        })

        it('should not render playground section when feature flag is disabled', async () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyPlaygroundEnabled) {
                    return false
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })

            renderNavbar('/app/ai-journey')

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Playground')).not.toBeInTheDocument()
        })
    })

    describe('Campaigns section', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyCampaignsEnabled) {
                    return true
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })
        })

        it('should not render campaigns section when feature flag is disabled', async () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyCampaignsEnabled) {
                    return false
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })

            renderNavbar('/app/ai-journey')

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
        })

        it('should render campaigns section when journey exists', async () => {
            renderNavbar()

            expect(screen.getByText('Campaigns')).toBeInTheDocument()
        })

        it('should highlight campaigns link when pathname contains "campaign"', async () => {
            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore({})}>
                        <ThemeProvider>
                            <SidebarContext.Provider
                                value={{
                                    isCollapsed: false,
                                    toggleCollapse: mockToggleCollapse,
                                }}
                            >
                                <AiJourneyNavbar />
                            </SidebarContext.Provider>
                        </ThemeProvider>
                    </Provider>
                </QueryClientProvider>,
                {
                    wrapper: ({ children }: { children: ReactNode }) => (
                        <StaticRouter location="/app/ai-journey/teststore1/campaigns">
                            <NavBarProvider>{children}</NavBarProvider>
                        </StaticRouter>
                    ),
                },
            )

            const campaignsLink = screen.getByText('Campaigns').closest('a')
            expect(campaignsLink).toHaveClass('active')
        })

        it('should highlight campaigns link when pathname contains "campaign" (singular)', async () => {
            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore({})}>
                        <ThemeProvider>
                            <SidebarContext.Provider
                                value={{
                                    isCollapsed: false,
                                    toggleCollapse: mockToggleCollapse,
                                }}
                            >
                                <JourneyProvider>
                                    <AiJourneyNavbar />
                                </JourneyProvider>
                            </SidebarContext.Provider>
                        </ThemeProvider>
                    </Provider>
                </QueryClientProvider>,
                {
                    wrapper: ({ children }: { children: ReactNode }) => (
                        <StaticRouter location="/app/ai-journey/teststore1/campaign/123">
                            <NavBarProvider>{children}</NavBarProvider>
                        </StaticRouter>
                    ),
                },
            )

            const campaignsLink = screen.getByText('Campaigns').closest('a')
            expect(campaignsLink).toHaveClass('active')
        })
    })
})
