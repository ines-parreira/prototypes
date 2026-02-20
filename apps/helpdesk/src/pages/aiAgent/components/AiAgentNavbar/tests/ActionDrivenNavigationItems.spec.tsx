import { render, screen } from '@testing-library/react'
import userEventLib from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { Navigation } from 'components/Navigation/Navigation'
import { OPPORTUNITIES } from 'pages/aiAgent/constants'
import type { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { ActionDrivenNavigationItems } from '../ActionDrivenNavigationItems'

const mockStore = configureStore([])

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <div data-testid="skeleton" />,
}))

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(() => ({
        id: 1,
        name: 'FAQ Help Center',
    })),
}))

const mockUseOpportunitiesCount = jest.fn((arg1: any, arg2: any, arg3: any) => {
    void arg1
    void arg2
    void arg3
    return {
        count: 5,
        isLoading: false,
    }
})

jest.mock('pages/aiAgent/hooks/useOpportunitiesCount', () => ({
    useOpportunitiesCount: (...args: [number, string, string]) =>
        mockUseOpportunitiesCount(...args),
}))

const mockUseGetStoresConfigurationForAccount = jest.fn(
    (arg1: any, arg2: any) => {
        void arg1
        void arg2
        return {
            data: {
                storeConfigurations: [
                    {
                        storeName: 'test-store',
                        helpCenterId: 123,
                    },
                ],
            },
        }
    },
)

jest.mock('models/aiAgent/queries', () => ({
    useGetStoresConfigurationForAccount: (...args: [object, object]) =>
        mockUseGetStoresConfigurationForAccount(...args),
}))

const mockNavigationItems: NavigationItem[] = [
    {
        route: '/app/ai-agent/shopify/test-store',
        title: 'Overview',
        exact: true,
        dataCanduId: 'overview',
    },
    {
        route: '',
        title: 'Analyze',
        items: [
            {
                route: '/app/ai-agent/shopify/test-store/analyze/analytics',
                title: 'Analytics',
            },
            {
                route: '/app/ai-agent/shopify/test-store/analyze/opportunities',
                title: 'Opportunities',
            },
        ],
    },
    {
        route: '',
        title: 'Deploy',
        items: [
            {
                route: '/app/ai-agent/shopify/test-store/deploy/chat',
                title: 'Chat',
                exact: true,
            },
            {
                route: '/app/ai-agent/shopify/test-store/deploy/email',
                title: 'Email',
                exact: true,
            },
        ],
    },
    {
        route: '/app/ai-agent/shopify/test-store/chat',
        title: 'Chat',
    },
    {
        route: '/app/ai-agent/shopify/test-store/email',
        title: 'Email',
    },
]

describe('ActionDrivenNavigationItems', () => {
    const mockGetChannelStatus = jest.fn()
    const createStore = (customState: any = {}) => {
        const defaultState = {
            ui: {
                helpCenter: {
                    currentLanguage: 'en-US',
                },
            },
            currentAccount: fromJS({
                domain: 'test-domain.com',
            }),
        }

        // Deep merge the custom state
        const mergedState = {
            ...defaultState,
            ...customState,
            ui: {
                ...defaultState.ui,
                ...customState.ui,
                helpCenter: {
                    ...defaultState.ui.helpCenter,
                    ...customState.ui?.helpCenter,
                },
            },
            // Ensure currentAccount is preserved if not overridden
            currentAccount:
                customState.currentAccount !== undefined
                    ? customState.currentAccount
                    : defaultState.currentAccount,
        }

        return mockStore(mergedState)
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetChannelStatus.mockReturnValue(false)
        mockUseOpportunitiesCount.mockReturnValue({
            count: 5,
            isLoading: false,
        })
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            data: {
                storeConfigurations: [
                    {
                        storeName: 'test-store',
                        helpCenterId: 123,
                    },
                ],
            },
        })
    })

    const renderComponent = (
        props: Partial<Parameters<typeof ActionDrivenNavigationItems>[0]> = {},
        customStore = createStore(),
    ) => {
        return render(
            <Provider store={customStore}>
                <MemoryRouter>
                    <Navigation.Root value={['analyze', 'deploy']}>
                        <ActionDrivenNavigationItems
                            navigationItems={mockNavigationItems}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                            {...props}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )
    }

    it('renders null when selectedStore is not provided', () => {
        const { container } = render(
            <Provider store={createStore()}>
                <MemoryRouter>
                    <Navigation.Root>
                        <ActionDrivenNavigationItems
                            navigationItems={mockNavigationItems}
                            selectedStore={undefined}
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        expect(
            container.querySelector('[role="button"]'),
        ).not.toBeInTheDocument()
        expect(container.querySelector('[role="link"]')).not.toBeInTheDocument()
    })

    it('renders null when navigationItems is not provided', () => {
        const { container } = render(
            <Provider store={createStore()}>
                <MemoryRouter>
                    <Navigation.Root>
                        <ActionDrivenNavigationItems
                            navigationItems={undefined as any}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        expect(
            container.querySelector('[role="button"]'),
        ).not.toBeInTheDocument()
        expect(container.querySelector('[role="link"]')).not.toBeInTheDocument()
    })

    it('renders navigation items without nested items', () => {
        renderComponent()

        expect(screen.getByText('Overview')).toBeInTheDocument()
        const overviewLink = screen.getByRole('link', { name: 'Overview' })
        expect(overviewLink).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store',
        )
    })

    it('renders navigation sections with nested items', async () => {
        renderComponent()

        const analyzeButton = screen.getByRole('button', { name: /Analyze/ })
        expect(analyzeButton).toBeInTheDocument()

        expect(screen.getByText('Analytics')).toBeInTheDocument()
        const opportunitiesLink = screen.getByRole('link', {
            name: /Opportunities/,
        })
        expect(opportunitiesLink).toBeInTheDocument()
    })

    it('renders status indicator for Chat channel when active', () => {
        mockGetChannelStatus.mockImplementation((channel) => channel === 'chat')
        renderComponent()

        const chatElements = screen.getAllByText('Chat')
        expect(chatElements).toHaveLength(2)

        const statusIcons = screen.getAllByAltText('status icon')
        expect(statusIcons).toHaveLength(2)
    })

    it('renders status indicator for Email channel when active', () => {
        mockGetChannelStatus.mockImplementation(
            (channel) => channel === 'email',
        )
        renderComponent()

        const emailElements = screen.getAllByText('Email')
        expect(emailElements).toHaveLength(2)

        const statusIcons = screen.getAllByAltText('status icon')
        expect(statusIcons).toHaveLength(2)
    })

    it('calls getChannelStatus with correct channel type for Chat', () => {
        renderComponent()

        expect(mockGetChannelStatus).toHaveBeenCalledWith('chat')
    })

    it('calls getChannelStatus with correct channel type for Email', () => {
        renderComponent()

        expect(mockGetChannelStatus).toHaveBeenCalledWith('email')
        expect(mockGetChannelStatus).toHaveBeenCalledWith('chat')
    })

    it('renders status indicator with correct src for active channel', () => {
        mockGetChannelStatus.mockImplementation((channel) => channel === 'chat')
        renderComponent()

        const statusIcons = screen.getAllByAltText('status icon')
        const chatStatusIcon = statusIcons.find((icon) => {
            const parent = icon.parentElement
            return parent?.textContent?.includes('Chat')
        })

        expect(chatStatusIcon).toHaveAttribute('src', 'test-file-stub')
    })

    it('renders status indicator with correct src for inactive channel', () => {
        mockGetChannelStatus.mockReturnValue(false)
        renderComponent()

        const statusIcons = screen.getAllByAltText('status icon')
        const firstStatusIcon = statusIcons[0]

        expect(firstStatusIcon).toHaveAttribute('src', 'test-file-stub')
    })

    it('handles getChannelStatus not provided', () => {
        render(
            <Provider store={createStore()}>
                <MemoryRouter>
                    <Navigation.Root value={['deploy']}>
                        <ActionDrivenNavigationItems
                            navigationItems={mockNavigationItems}
                            selectedStore="test-store"
                            getChannelStatus={undefined}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        const chatElements = screen.getAllByText('Chat')
        expect(chatElements).toHaveLength(2)

        const statusIcons = screen.getAllByAltText('status icon')
        statusIcons.forEach((icon) => {
            expect(icon).toHaveAttribute('src', 'test-file-stub')
        })
    })

    it('applies correct props to navigation section items', () => {
        renderComponent()

        const overviewItem = screen.getByRole('link', { name: 'Overview' })
        expect(overviewItem).toHaveAttribute('data-candu-id', 'overview')
        expect(overviewItem).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store',
        )
    })

    it('renders nested items with proper links', () => {
        renderComponent()

        const analyticsItem = screen.getByRole('link', { name: 'Analytics' })
        expect(analyticsItem).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store/analyze/analytics',
        )

        const opportunitiesItem = screen.getByRole('link', {
            name: /Opportunities/,
        })
        expect(opportunitiesItem).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-store/analyze/opportunities',
        )
    })

    it('allows expanding and collapsing sections', async () => {
        const user = userEventLib.setup()
        const store = createStore()
        const { rerender } = render(
            <Provider store={store}>
                <MemoryRouter>
                    <Navigation.Root value={[]}>
                        <ActionDrivenNavigationItems
                            navigationItems={mockNavigationItems}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        const analyzeButton = screen.getByRole('button', { name: /Analyze/ })
        expect(analyzeButton).toHaveAttribute('aria-expanded', 'false')

        await user.click(analyzeButton)

        rerender(
            <Provider store={store}>
                <MemoryRouter>
                    <Navigation.Root value={['analyze']}>
                        <ActionDrivenNavigationItems
                            navigationItems={mockNavigationItems}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        expect(analyzeButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('handles empty navigation items array', () => {
        const { container } = render(
            <Provider store={createStore()}>
                <MemoryRouter>
                    <Navigation.Root>
                        <ActionDrivenNavigationItems
                            navigationItems={[]}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        const links = screen.queryAllByRole('link')
        const buttons = screen.queryAllByRole('button')

        expect(links).toHaveLength(0)
        expect(buttons).toHaveLength(0)
        expect(container).toBeInTheDocument()
    })

    it('handles navigation items with only nested items', () => {
        const nestedOnlyItems: NavigationItem[] = [
            {
                route: '',
                title: 'Section',
                items: [
                    {
                        route: '/app/ai-agent/shopify/test-store/section/item1',
                        title: 'Item 1',
                    },
                    {
                        route: '/app/ai-agent/shopify/test-store/section/item2',
                        title: 'Item 2',
                    },
                ],
            },
        ]

        render(
            <Provider store={createStore()}>
                <MemoryRouter>
                    <Navigation.Root value={['section']}>
                        <ActionDrivenNavigationItems
                            navigationItems={nestedOnlyItems}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        const sectionButton = screen.getByRole('button', { name: /Section/ })
        expect(sectionButton).toBeInTheDocument()
        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('handles navigation items without nested items', () => {
        const flatItems: NavigationItem[] = [
            {
                route: '/app/ai-agent/shopify/test-store/item1',
                title: 'Item 1',
            },
            {
                route: '/app/ai-agent/shopify/test-store/item2',
                title: 'Item 2',
            },
        ]

        render(
            <Provider store={createStore()}>
                <MemoryRouter>
                    <Navigation.Root>
                        <ActionDrivenNavigationItems
                            navigationItems={flatItems}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()

        const buttons = screen.queryAllByRole('button')
        expect(buttons).toHaveLength(0)
    })

    it('renders status indicators correctly in both standalone and nested items', () => {
        mockGetChannelStatus.mockImplementation((channel) => channel === 'chat')

        render(
            <Provider store={createStore()}>
                <MemoryRouter>
                    <Navigation.Root value={['deploy']}>
                        <ActionDrivenNavigationItems
                            navigationItems={mockNavigationItems}
                            selectedStore="test-store"
                            getChannelStatus={mockGetChannelStatus}
                        />
                    </Navigation.Root>
                </MemoryRouter>
            </Provider>,
        )

        const statusIcons = screen.getAllByAltText('status icon')
        expect(statusIcons).toHaveLength(2)

        expect(mockGetChannelStatus).toHaveBeenCalledWith('chat')
        expect(mockGetChannelStatus).toHaveBeenCalledWith('email')
        expect(mockGetChannelStatus).toHaveBeenCalledTimes(2)
    })

    describe('Opportunities feature', () => {
        it('renders Opportunities with BETA tag and count in nested items', () => {
            const navItemsWithOpportunities: NavigationItem[] = [
                {
                    route: '',
                    title: 'Analyze',
                    items: [
                        {
                            route: '/app/ai-agent/shopify/test-store/analyze/opportunities',
                            title: OPPORTUNITIES,
                        },
                    ],
                },
            ]

            render(
                <Provider store={createStore()}>
                    <MemoryRouter>
                        <Navigation.Root value={['analyze']}>
                            <ActionDrivenNavigationItems
                                navigationItems={navItemsWithOpportunities}
                                selectedStore="test-store"
                                getChannelStatus={mockGetChannelStatus}
                            />
                        </Navigation.Root>
                    </MemoryRouter>
                </Provider>,
            )

            expect(screen.getByText(OPPORTUNITIES)).toBeInTheDocument()
            expect(screen.getByText('Beta')).toBeInTheDocument()
            expect(screen.getByText('5')).toBeInTheDocument()
        })

        it('renders Opportunities with BETA tag and count in top-level items', () => {
            const navItemsWithOpportunities: NavigationItem[] = [
                {
                    route: '/app/ai-agent/shopify/test-store/opportunities',
                    title: OPPORTUNITIES,
                },
            ]

            render(
                <Provider store={createStore()}>
                    <MemoryRouter>
                        <Navigation.Root>
                            <ActionDrivenNavigationItems
                                navigationItems={navItemsWithOpportunities}
                                selectedStore="test-store"
                                getChannelStatus={mockGetChannelStatus}
                            />
                        </Navigation.Root>
                    </MemoryRouter>
                </Provider>,
            )

            expect(screen.getByText(OPPORTUNITIES)).toBeInTheDocument()
            expect(screen.getByText('Beta')).toBeInTheDocument()
            expect(screen.getByText('5')).toBeInTheDocument()
        })

        it('shows skeleton when opportunities are loading', () => {
            mockUseOpportunitiesCount.mockReturnValue({
                count: 10,
                isLoading: true,
            })

            const navItemsWithOpportunities: NavigationItem[] = [
                {
                    route: '/app/ai-agent/shopify/test-store/opportunities',
                    title: OPPORTUNITIES,
                },
            ]

            render(
                <Provider store={createStore()}>
                    <MemoryRouter>
                        <Navigation.Root>
                            <ActionDrivenNavigationItems
                                navigationItems={navItemsWithOpportunities}
                                selectedStore="test-store"
                                getChannelStatus={mockGetChannelStatus}
                            />
                        </Navigation.Root>
                    </MemoryRouter>
                </Provider>,
            )

            expect(screen.getByTestId('skeleton')).toBeInTheDocument()
            expect(screen.queryByText('10')).not.toBeInTheDocument()
        })

        it('shows opportunities count when not loading', () => {
            mockUseOpportunitiesCount.mockReturnValue({
                count: 15,
                isLoading: false,
            })

            const navItemsWithOpportunities: NavigationItem[] = [
                {
                    route: '/app/ai-agent/shopify/test-store/opportunities',
                    title: OPPORTUNITIES,
                },
            ]

            render(
                <Provider store={createStore()}>
                    <MemoryRouter>
                        <Navigation.Root>
                            <ActionDrivenNavigationItems
                                navigationItems={navItemsWithOpportunities}
                                selectedStore="test-store"
                                getChannelStatus={mockGetChannelStatus}
                            />
                        </Navigation.Root>
                    </MemoryRouter>
                </Provider>,
            )

            expect(screen.getByText('15')).toBeInTheDocument()
        })
    })

    describe('Store configuration', () => {
        it('fetches store configuration when store and domain are provided', () => {
            renderComponent()

            expect(
                mockUseGetStoresConfigurationForAccount,
            ).toHaveBeenCalledWith(
                { accountDomain: 'test-domain.com' },
                expect.objectContaining({
                    enabled: true,
                    staleTime: 5 * 60 * 1000,
                }),
            )
        })

        it('does not fetch store configuration when store is not provided', () => {
            mockUseGetStoresConfigurationForAccount.mockClear()

            renderComponent({ selectedStore: undefined })

            expect(
                mockUseGetStoresConfigurationForAccount,
            ).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('does not fetch store configuration when domain is not provided', () => {
            mockUseGetStoresConfigurationForAccount.mockClear()
            const storeWithoutDomain = createStore({
                currentAccount: fromJS({
                    domain: undefined,
                }),
            })

            renderComponent({}, storeWithoutDomain)

            expect(
                mockUseGetStoresConfigurationForAccount,
            ).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('uses correct helpCenterId from store configuration', () => {
            mockUseGetStoresConfigurationForAccount.mockReturnValue({
                data: {
                    storeConfigurations: [
                        {
                            storeName: 'test-store',
                            helpCenterId: 999,
                        },
                    ],
                },
            })

            renderComponent()

            expect(mockUseOpportunitiesCount).toHaveBeenCalledWith(
                999,
                'en-US',
                'test-store',
            )
        })

        it('handles missing store configuration', () => {
            mockUseGetStoresConfigurationForAccount.mockReturnValue({
                data: {
                    storeConfigurations: [
                        {
                            storeName: 'other-store',
                            helpCenterId: 456,
                        },
                    ],
                },
            })

            renderComponent()

            expect(mockUseOpportunitiesCount).toHaveBeenCalledWith(
                0,
                'en-US',
                'test-store',
            )
        })

        it('handles undefined store configurations data', () => {
            mockUseGetStoresConfigurationForAccount.mockReturnValue({
                data: undefined as any,
            })

            renderComponent()

            expect(mockUseOpportunitiesCount).toHaveBeenCalledWith(
                0,
                'en-US',
                'test-store',
            )
        })
    })

    describe('Language support', () => {
        it('uses view language from state', () => {
            const storeWithLanguage = createStore({
                ui: {
                    helpCenter: {
                        currentLanguage: 'fr-FR',
                    },
                },
            })

            renderComponent({}, storeWithLanguage)

            expect(mockUseOpportunitiesCount).toHaveBeenCalledWith(
                expect.any(Number),
                'fr-FR',
                'test-store',
            )
        })

        it('uses default locale when viewLanguage is not set', () => {
            const storeWithoutLanguage = createStore({
                ui: {
                    helpCenter: {
                        currentLanguage: undefined,
                    },
                },
            })

            renderComponent({}, storeWithoutLanguage)

            expect(mockUseOpportunitiesCount).toHaveBeenCalledWith(
                expect.any(Number),
                'en-US',
                'test-store',
            )
        })
    })

    describe('StatusIndicator component', () => {
        it('renders active status with success icon', () => {
            const navItems: NavigationItem[] = [
                {
                    route: '',
                    title: 'Deploy',
                    items: [
                        {
                            route: '/chat',
                            title: 'Chat',
                        },
                    ],
                },
            ]

            mockGetChannelStatus.mockReturnValue(true)

            render(
                <Provider store={createStore()}>
                    <MemoryRouter>
                        <Navigation.Root value={['deploy']}>
                            <ActionDrivenNavigationItems
                                navigationItems={navItems}
                                selectedStore="test-store"
                                getChannelStatus={mockGetChannelStatus}
                            />
                        </Navigation.Root>
                    </MemoryRouter>
                </Provider>,
            )

            const statusIcon = screen.getByAltText('status icon')
            expect(statusIcon).toBeInTheDocument()
            expect(statusIcon).toHaveAttribute('src', 'test-file-stub')
        })

        it('renders inactive status with error icon', () => {
            const navItems: NavigationItem[] = [
                {
                    route: '',
                    title: 'Deploy',
                    items: [
                        {
                            route: '/email',
                            title: 'Email',
                        },
                    ],
                },
            ]

            mockGetChannelStatus.mockReturnValue(false)

            render(
                <Provider store={createStore()}>
                    <MemoryRouter>
                        <Navigation.Root value={['deploy']}>
                            <ActionDrivenNavigationItems
                                navigationItems={navItems}
                                selectedStore="test-store"
                                getChannelStatus={mockGetChannelStatus}
                            />
                        </Navigation.Root>
                    </MemoryRouter>
                </Provider>,
            )

            const statusIcon = screen.getByAltText('status icon')
            expect(statusIcon).toBeInTheDocument()
            expect(statusIcon).toHaveAttribute('src', 'test-file-stub')
        })
    })
})
