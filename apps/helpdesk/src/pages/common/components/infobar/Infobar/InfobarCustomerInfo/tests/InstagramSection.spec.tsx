import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import type { Store } from 'redux'

import {
    mockInstagramProfile,
    mockListInstagramProfilesHandler,
} from '@gorgias/helpdesk-mocks'

import { appQueryClient } from 'api/queryClient'
import { ThemeProvider } from 'core/theme'

import { InstagramSection } from '../InstagramSection'

const server = setupServer()

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))
const useFlagMock = useFlag as jest.Mock

const mocksStore = {
    getState: () => ({
        integrations: fromJS({
            integrations: [
                {
                    id: 123,
                    type: 'facebook',
                    meta: {
                        instagram: {
                            id: 'ig_business_123',
                        },
                    },
                },
            ],
        }),
        ticket: fromJS({
            messages: [
                {
                    id: 1,
                    integration_id: 123,
                    sender: {
                        name: 'test_user',
                    },
                },
            ],
        }),
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
} as unknown as Store

const mockCustomer = fromJS({
    id: 1,
    name: 'test_user',
})

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <Provider store={mocksStore}>
                <QueryClientProvider client={appQueryClient}>
                    <ThemeProvider>
                        <InstagramSection customer={mockCustomer} />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
    appQueryClient.clear()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('InstagramSection', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should return null when customer handle is not present', () => {
        const storeWithoutMessages = {
            getState: () => ({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'facebook',
                            meta: {
                                instagram: {
                                    id: 'ig_business_123',
                                },
                            },
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [],
                }),
            }),
            dispatch: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        } as unknown as Store

        const { container } = render(
            <MemoryRouter>
                <Provider store={storeWithoutMessages}>
                    <QueryClientProvider client={appQueryClient}>
                        <ThemeProvider>
                            <InstagramSection customer={mockCustomer} />
                        </ThemeProvider>
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle integration without instagram meta', async () => {
        const storeWithoutInstagramMeta = {
            getState: () => ({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'facebook',
                            meta: {},
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [
                        {
                            id: 1,
                            integration_id: 123,
                            sender: {
                                name: 'test_user',
                            },
                        },
                    ],
                }),
            }),
            dispatch: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        } as unknown as Store

        render(
            <MemoryRouter>
                <Provider store={storeWithoutInstagramMeta}>
                    <QueryClientProvider client={appQueryClient}>
                        <ThemeProvider>
                            <InstagramSection customer={mockCustomer} />
                        </ThemeProvider>
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() => {
            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
        })
    })

    it('should handle empty instagram profiles response', async () => {
        useFlagMock.mockReturnValue(true)

        const mockListInstagramProfiles = mockListInstagramProfilesHandler(
            async () =>
                HttpResponse.json({
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 0,
                    },
                    object: 'list',
                    uri: '/api/instagram/profiles',
                }),
        )
        server.use(mockListInstagramProfiles.handler)

        renderComponent()

        await waitFor(() => {
            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
        })

        expect(screen.queryByText(/Following:/)).not.toBeInTheDocument()
    })

    describe('when InstagramUserSection flag is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('should render Instagram handle with link', async () => {
            renderComponent()

            await waitFor(() => {
                const igLink = screen.getByRole('link', { name: /@test_user/ })
                expect(igLink).toBeInTheDocument()
                expect(igLink).toHaveAttribute(
                    'href',
                    'https://www.instagram.com/test_user',
                )
                expect(igLink).toHaveAttribute('target', '_blank')
                expect(igLink).toHaveAttribute('rel', 'noopener noreferrer')
            })
        })

        it('should log segment event when clicking handle', async () => {
            const user = userEvent.setup()
            renderComponent()

            const igLink = await screen.findByRole('link', {
                name: /@test_user/,
            })

            expect(igLink).toHaveAttribute(
                'href',
                'https://www.instagram.com/test_user',
            )
            expect(igLink).toHaveAttribute('target', '_blank')
            expect(igLink).toHaveAttribute('rel', 'noopener noreferrer')

            await act(() => user.click(igLink))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.InstagramHandleClicked,
            )
        })

        it('should not render details section', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('link', { name: /@test_user/ }),
                ).toBeInTheDocument()
            })

            expect(screen.queryByText('Following:')).not.toBeInTheDocument()
            expect(screen.queryByText(/followers/)).not.toBeInTheDocument()
        })
    })

    describe('when InstagramUserSection flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should render Instagram handle with link', async () => {
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                id: 'ig_123',
                                username: 'test_user',
                                name: 'Test User',
                                is_verified: true,
                                business_follows_customer: true,
                                customer_follows_business: false,
                                total_followers: 14700,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                const igLink = screen.getByRole('link', { name: /@test_user/ })
                expect(igLink).toBeInTheDocument()
                expect(igLink).toHaveAttribute(
                    'href',
                    'https://www.instagram.com/test_user',
                )
                expect(igLink).toHaveAttribute('target', '_blank')
                expect(igLink).toHaveAttribute('rel', 'noopener noreferrer')
            })
        })

        it('should log segment event when clicking handle', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                total_followers: 14700,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            const igLink = await screen.findByRole('link', {
                name: /@test_user/,
            })

            expect(igLink).toHaveAttribute(
                'href',
                'https://www.instagram.com/test_user',
            )
            expect(igLink).toHaveAttribute('target', '_blank')
            expect(igLink).toHaveAttribute('rel', 'noopener noreferrer')

            await act(() => user.click(igLink))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.InstagramHandleClicked,
            )
        })

        it('should render details section with follower information', async () => {
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                business_follows_customer: true,
                                customer_follows_business: false,
                                total_followers: 14700,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Following:/)).toBeInTheDocument()
                expect(screen.getByText(/Follower:/)).toBeInTheDocument()
                expect(screen.getByText('14.7k followers')).toBeInTheDocument()
            })
        })

        it('should render verified badge icon', async () => {
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                is_verified: true,
                                total_followers: 14700,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                const verifiedIcon = screen.getByRole('img', {
                    name: 'wavy-check',
                })
                expect(verifiedIcon).toBeInTheDocument()
            })
        })

        it('should not render verified badge icon when user is not verified', async () => {
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                is_verified: false,
                                total_followers: 14700,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                const igLink = screen.getByRole('link', { name: /@test_user/ })
                expect(igLink).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('img', { name: 'wavy-check' }),
            ).not.toBeInTheDocument()
        })

        it('should render Instagram name when present', async () => {
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                name: 'Test User Full Name',
                                total_followers: 1000,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('Test User Full Name'),
                ).toBeInTheDocument()
            })
        })

        it('should not render name section when name is not present', async () => {
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                name: undefined,
                                total_followers: 1000,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Following:/)).toBeInTheDocument()
            })

            expect(screen.queryByText(/Test User/)).not.toBeInTheDocument()
        })

        it('should show check icon and correct tooltip when business follows customer', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                business_follows_customer: true,
                                customer_follows_business: false,
                                total_followers: 1000,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Following:/)).toBeInTheDocument()
            })

            // Expand details section
            const chevron = screen.getByRole('img', {
                name: /arrow-chevron-down/,
            })
            await act(() => user.click(chevron))

            // Following section should have a check icon
            const checkIcons = screen.getAllByRole('img', { name: 'check' })
            expect(checkIcons.length).toBeGreaterThan(0)

            // Hover over the Following text to show tooltip
            const followingText = screen.getByText(/Following:/)
            await act(() => user.hover(followingText))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Your business follows this customer on Instagram',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should show close icon and correct tooltip when business does not follow customer', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                business_follows_customer: false,
                                customer_follows_business: true,
                                total_followers: 1000,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Following:/)).toBeInTheDocument()
            })

            // Expand details section
            const chevron = screen.getByRole('img', {
                name: /arrow-chevron-down/,
            })
            await act(() => user.click(chevron))

            // Following section should have a close icon
            const closeIcons = screen.getAllByRole('img', { name: 'close' })
            expect(closeIcons.length).toBeGreaterThan(0)

            // Hover over the Following text to show tooltip
            const followingText = screen.getByText(/Following:/)
            await act(() => user.hover(followingText))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "Your business doesn't follow this customer on Instagram",
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should show check icon and correct tooltip when customer follows business', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                business_follows_customer: false,
                                customer_follows_business: true,
                                total_followers: 1000,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Follower:/)).toBeInTheDocument()
            })

            // Expand details section
            const chevron = screen.getByRole('img', {
                name: /arrow-chevron-down/,
            })
            await act(() => user.click(chevron))

            // Follower section should have a check icon
            const checkIcons = screen.getAllByRole('img', { name: 'check' })
            expect(checkIcons.length).toBeGreaterThan(0)

            // Hover over the Follower text to show tooltip
            const followerText = screen.getByText(/Follower:/)
            await act(() => user.hover(followerText))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Customer follows your business on Instagram',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should show close icon and correct tooltip when customer does not follow business', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                business_follows_customer: true,
                                customer_follows_business: false,
                                total_followers: 1000,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Follower:/)).toBeInTheDocument()
            })

            // Expand details section
            const chevron = screen.getByRole('img', {
                name: /arrow-chevron-down/,
            })
            await act(() => user.click(chevron))

            // Follower section should have a close icon
            const closeIcons = screen.getAllByRole('img', { name: 'close' })
            expect(closeIcons.length).toBeGreaterThan(0)

            // Hover over the Follower text to show tooltip
            const followerText = screen.getByText(/Follower:/)
            await act(() => user.hover(followerText))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "Customer doesn't follow your business on Instagram",
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should show chevron-down icon when details are initially collapsed', async () => {
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                total_followers: 14700,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            const chevronDown = await screen.findByRole('img', {
                name: 'arrow-chevron-down',
            })
            expect(chevronDown).toBeInTheDocument()
            expect(
                screen.queryByRole('img', { name: 'arrow-chevron-up' }),
            ).not.toBeInTheDocument()
        })

        it('should toggle details section when clicking chevron', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = mockListInstagramProfilesHandler(
                async () =>
                    HttpResponse.json({
                        data: [
                            mockInstagramProfile({
                                username: 'test_user',
                                name: 'Test User',
                                total_followers: 14700,
                                business_follows_customer: true,
                                customer_follows_business: false,
                            }),
                        ],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/instagram/profiles',
                    }),
            )
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            // Wait for component to load with chevron (means data is loaded)
            const chevronDown = await screen.findByRole('img', {
                name: 'arrow-chevron-down',
            })
            expect(chevronDown).toBeInTheDocument()

            // Click chevron to expand
            await act(() => user.click(chevronDown))

            // Chevron should change to up (expanded state)
            await waitFor(() => {
                expect(
                    screen.getByRole('img', { name: 'arrow-chevron-up' }),
                ).toBeInTheDocument()
            })

            // Details should now be visible
            expect(screen.getByText('Test User')).toBeInTheDocument()
            expect(screen.getByText(/Following:/)).toBeInTheDocument()
            expect(screen.getByText('14.7k followers')).toBeInTheDocument()

            // Click chevron again to collapse
            const chevronUp = screen.getByRole('img', {
                name: 'arrow-chevron-up',
            })
            await act(() => user.click(chevronUp))

            // Chevron should change back to down (collapsed state)
            await waitFor(() => {
                expect(
                    screen.getByRole('img', { name: 'arrow-chevron-down' }),
                ).toBeInTheDocument()
            })
        })

        describe('follower count formatting', () => {
            it('should format follower count < 1000 as exact number', async () => {
                const mockListInstagramProfiles =
                    mockListInstagramProfilesHandler(async () =>
                        HttpResponse.json({
                            data: [
                                mockInstagramProfile({
                                    username: 'test_user',
                                    total_followers: 500,
                                }),
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                            object: 'list',
                            uri: '/api/instagram/profiles',
                        }),
                    )
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(
                        screen.getByText('500 followers'),
                    ).toBeInTheDocument()
                })
            })

            it('should format follower count 1k-9.9k with one decimal place', async () => {
                const mockListInstagramProfiles =
                    mockListInstagramProfilesHandler(async () =>
                        HttpResponse.json({
                            data: [
                                mockInstagramProfile({
                                    username: 'test_user',
                                    total_followers: 5500,
                                }),
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                            object: 'list',
                            uri: '/api/instagram/profiles',
                        }),
                    )
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(
                        screen.getByText('5.5k followers'),
                    ).toBeInTheDocument()
                })
            })

            it('should format follower count 10k-99.9k with one decimal place', async () => {
                const mockListInstagramProfiles =
                    mockListInstagramProfilesHandler(async () =>
                        HttpResponse.json({
                            data: [
                                mockInstagramProfile({
                                    username: 'test_user',
                                    total_followers: 14700,
                                }),
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                            object: 'list',
                            uri: '/api/instagram/profiles',
                        }),
                    )
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(
                        screen.getByText('14.7k followers'),
                    ).toBeInTheDocument()
                })
            })

            it('should format follower count 100k-999k without decimal places', async () => {
                const mockListInstagramProfiles =
                    mockListInstagramProfilesHandler(async () =>
                        HttpResponse.json({
                            data: [
                                mockInstagramProfile({
                                    username: 'test_user',
                                    total_followers: 150000,
                                }),
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                            object: 'list',
                            uri: '/api/instagram/profiles',
                        }),
                    )
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(
                        screen.getByText('150k followers'),
                    ).toBeInTheDocument()
                })
            })

            it('should format follower count 1M-9.9M with one decimal place', async () => {
                const mockListInstagramProfiles =
                    mockListInstagramProfilesHandler(async () =>
                        HttpResponse.json({
                            data: [
                                mockInstagramProfile({
                                    username: 'test_user',
                                    total_followers: 1500000,
                                }),
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                            object: 'list',
                            uri: '/api/instagram/profiles',
                        }),
                    )
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(
                        screen.getByText('1.5M followers'),
                    ).toBeInTheDocument()
                })
            })

            it('should format follower count 10M+ without decimal places', async () => {
                const mockListInstagramProfiles =
                    mockListInstagramProfilesHandler(async () =>
                        HttpResponse.json({
                            data: [
                                mockInstagramProfile({
                                    username: 'test_user',
                                    total_followers: 15000000,
                                }),
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                            object: 'list',
                            uri: '/api/instagram/profiles',
                        }),
                    )
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(
                        screen.getByText('15M followers'),
                    ).toBeInTheDocument()
                })
            })

            it('should remove trailing .0 from formatted numbers', async () => {
                const mockListInstagramProfiles =
                    mockListInstagramProfilesHandler(async () =>
                        HttpResponse.json({
                            data: [
                                mockInstagramProfile({
                                    username: 'test_user',
                                    total_followers: 5000,
                                }),
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                            object: 'list',
                            uri: '/api/instagram/profiles',
                        }),
                    )
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(screen.getByText('5k followers')).toBeInTheDocument()
                })
            })
        })
    })
})
