import type { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { StaticRouter, useHistory } from 'react-router-dom'

import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { NavBarProvider } from 'common/navigation/components/NavBarProvider'
import { useFlag } from 'core/flags'
import { ThemeProvider } from 'core/theme'
import { account } from 'fixtures/account'
import useAppSelector from 'hooks/useAppSelector'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { mockStore } from 'utils/testing'

import { AiJourneyNavbar } from './Navbar'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('core/flags', () => ({
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
const mockPush = jest.fn()
const mockReplace = jest.fn()

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
        journey: { type: 'cart_abandoned', id: 'journey-123' },
        journeyData: {
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
        it('should not render analytics section when no journey exists', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journey: undefined,
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

        it('should not render analytics section when journey exists without id', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journey: { type: 'cart_abandoned', id: undefined },
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

        it('should not render analytics section when journey is in draft state', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journey: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'draft',
                },
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
                journey: {
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

        it('should render analytics section when journey exists and is not in draft state', async () => {
            const mockJourneyContextWithoutJourney = {
                ...mockJourneyContext,
                journey: {
                    type: 'cart_abandoned',
                    id: 'journey-id',
                    state: 'paused',
                },
            }

            mockUseJourneyContext.mockReturnValue(
                mockJourneyContextWithoutJourney,
            )

            renderNavbar()

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-journey/teststore1',
            )
            expect(screen.getByText('Analytics')).toBeInTheDocument()
        })
    })
})
