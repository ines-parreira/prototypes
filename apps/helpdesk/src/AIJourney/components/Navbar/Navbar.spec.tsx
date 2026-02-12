import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { StaticRouter, useHistory, useParams } from 'react-router-dom'

import { useLastSelectedStore } from 'AIJourney/hooks'
import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'
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

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

const mockUseHistory = jest.mocked(useHistory)
const mockUseParams = jest.mocked(useParams)
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockSetLastSelectedStore = jest.fn()

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockUseFlag = useFlag as jest.Mock

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
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <AiJourneyNavbar />
                        </JourneyProvider>
                    </IntegrationsProvider>
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

    const mockJourneyContext = {
        journeyData: {
            type: 'cart_abandoned',
            id: 'journey-123',
            configuration: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_number: '415-111-111',
                sms_sender_integration_id: 1,
            },
        },
        currentIntegration: { id: 1, name: 'shopify-store' },
        shopName: 'shopify-store',
        isLoading: false,
        journeyType: 'cart_abandoned',
        storeConfiguration: {
            monitoredSmsIntegrations: [1, 2],
        },
        journeys: [
            {
                id: '01JZAPAD606K1JSKNHC8KVA4BD',
                type: 'cart_abandoned',
                account_id: 6069,
                store_integration_id: 33858,
                store_name: 'artemisathletix',
                store_type: 'shopify',
                state: 'active',
                message_instructions: '',
                created_datetime: '2025-07-04T12:24:29.121874',
                meta: {
                    ticket_view_id: 2099726,
                },
            },
        ],
        campaigns: [
            {
                id: '01KBJ589YAYKG7YHKH349KKZH0',
                type: 'campaign',
                account_id: 6069,
                store_integration_id: 33858,
                store_name: 'artemisathletix',
                store_type: 'shopify',
                state: 'active',
                message_instructions: null,
                created_datetime: '2025-12-03T13:08:31.820085',
                meta: {
                    ticket_view_id: 2137239,
                },
                campaign: {
                    title: '23123',
                    state: 'active',
                },
            },
        ],
    }

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

        mockUseJourneyContext.mockReturnValue(mockJourneyContext)
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
        renderNavbar()

        expect(mockReplace).toHaveBeenCalledWith('/app/ai-journey/teststore1')
        expect(screen.getByText('teststore1')).toBeInTheDocument()
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

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore2',
            )
        })

        it('should fall back to first store when stored store no longer exists', async () => {
            mockUseLastSelectedStore.mockReturnValue({
                setLastSelectedStore: mockSetLastSelectedStore,
                resolveStore: (storeNames: string[]) => storeNames[0],
            })

            renderNavbar()

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
            mockUseParams.mockReturnValue({ shopName: 'teststore2' })

            renderNavbar()

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

        it('should render analytics section when has journey, but does not have campaigns', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                campaigns: [],
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Analytics')).toBeInTheDocument()
        })

        it('should render analytics section when has campaigns, but does not have journey', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journeys: [],
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Analytics')).toBeInTheDocument()
        })

        it('should not render analytics section when no journey nor campaigns exists', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journeyData: undefined,
                journeys: [],
                campaigns: [],
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Analytics')).not.toBeInTheDocument()
        })

        it('should not render analytics section when feature flag is disabled', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journeyData: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'draft',
                },
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyAnalyticsEnabled) {
                    return false
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })

            renderNavbar()

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

        it('should render playground section when has journey, but does not have campaigns', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                campaigns: [],
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Playground')).toBeInTheDocument()
        })

        it('should render playground section when has campaign, but does not have journey', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journeys: [],
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Playground')).toBeInTheDocument()
        })

        it('should not render playground section when no journey nor campaigns exists', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journeyData: undefined,
                journeys: [],
                campaigns: [],
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Playground')).not.toBeInTheDocument()
        })

        it('should not render playground section when feature flag is disabled', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journeyData: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'draft',
                },
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyPlaygroundEnabled) {
                    return false
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })

            renderNavbar()

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

        it('should not render campaigns section when no journey exists', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journeyData: undefined,
                journeys: [],
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
        })

        it('should not render campaigns section when feature flag is disabled', async () => {
            const mockJourneyContextWithJourney = {
                ...mockJourneyContext,
                journeyData: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'paused',
                },
            }

            mockUseJourneyContext.mockReturnValue(mockJourneyContextWithJourney)

            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiJourneyCampaignsEnabled) {
                    return false
                }
                if (key === FeatureFlagKey.AiJourneyEnabled) {
                    return true
                }
                return false
            })

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
        })

        it('should render campaigns section when journey exists', async () => {
            const mockJourneyContextWithJourney = {
                ...mockJourneyContext,
                journeyData: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'paused',
                },
                journeys: [{ id: 'journey-id' }],
            }

            mockUseJourneyContext.mockReturnValue(mockJourneyContextWithJourney)

            renderNavbar()

            expect(screen.getByText('Campaigns')).toBeInTheDocument()
        })

        it('should highlight campaigns link when pathname contains "campaign"', async () => {
            const mockJourneyContextWithJourney = {
                ...mockJourneyContext,
                journeyData: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'paused',
                },
                journeys: [{ id: 'journey-id' }],
            }

            mockUseJourneyContext.mockReturnValue(mockJourneyContextWithJourney)

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore({})}>
                        <ThemeProvider>
                            <IntegrationsProvider>
                                <JourneyProvider>
                                    <AiJourneyNavbar />
                                </JourneyProvider>
                            </IntegrationsProvider>
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
            const mockJourneyContextWithJourney = {
                ...mockJourneyContext,
                journeyData: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'paused',
                },
                journeys: [{ id: 'journey-id' }],
            }

            mockUseJourneyContext.mockReturnValue(mockJourneyContextWithJourney)

            render(
                <QueryClientProvider client={appQueryClient}>
                    <Provider store={mockStore({})}>
                        <ThemeProvider>
                            <IntegrationsProvider>
                                <JourneyProvider>
                                    <AiJourneyNavbar />
                                </JourneyProvider>
                            </IntegrationsProvider>
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
