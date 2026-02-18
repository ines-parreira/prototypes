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

const createMockStore = (overrides?: {
    integrations?: any[]
    messages?: any[]
}) =>
    ({
        getState: () => ({
            integrations: fromJS({
                integrations: overrides?.integrations ?? [
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
                messages: overrides?.messages ?? [
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
    }) as unknown as Store

const mocksStore = createMockStore()

const mockCustomer = fromJS({
    id: 1,
    name: 'test_user',
})

const mockIgChannel = {
    address: 'test_user',
}

const renderComponent = (
    store: Store = mocksStore,
    igChannel: { address: string } | null | undefined = mockIgChannel,
) => {
    return render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={appQueryClient}>
                    <ThemeProvider>
                        <InstagramSection
                            customer={mockCustomer}
                            igChannel={igChannel}
                        />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

const createInstagramProfilesHandler = (
    profileData: Parameters<typeof mockInstagramProfile>[0] = {},
) =>
    mockListInstagramProfilesHandler(async () =>
        HttpResponse.json({
            data: [
                mockInstagramProfile({
                    username: 'test_user',
                    total_followers: 14700,
                    ...profileData,
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
    describe('when customer handle is not available', () => {
        it('should return null when no messages exist', () => {
            const storeWithoutMessages = createMockStore({ messages: [] })

            const { container } = renderComponent(storeWithoutMessages, null)

            expect(container.firstChild).toBeNull()
        })

        it('should return null when igChannel is not provided', () => {
            const { container } = render(
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

            expect(container.firstChild).toBeNull()
        })

        it('should return null when igChannel.address is null', () => {
            const { container } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <ThemeProvider>
                                <InstagramSection
                                    customer={mockCustomer}
                                    igChannel={{ address: null }}
                                />
                            </ThemeProvider>
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(container.firstChild).toBeNull()
        })

        it('should return null when igChannel.address is undefined', () => {
            const { container } = render(
                <MemoryRouter>
                    <Provider store={mocksStore}>
                        <QueryClientProvider client={appQueryClient}>
                            <ThemeProvider>
                                <InstagramSection
                                    customer={mockCustomer}
                                    igChannel={{}}
                                />
                            </ThemeProvider>
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('when integration lacks instagram meta', () => {
        it('should still render Instagram handle link', async () => {
            const storeWithoutInstagramMeta = createMockStore({
                integrations: [
                    {
                        id: 123,
                        type: 'facebook',
                        meta: {},
                    },
                ],
            })

            renderComponent(storeWithoutInstagramMeta)

            const igLink = await screen.findByRole('link', {
                name: /@test_user/,
            })
            expect(igLink).toBeInTheDocument()
        })
    })

    describe('when Instagram profiles API returns empty response', () => {
        it('should render basic handle without follower details', async () => {
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

            const igLink = await screen.findByRole('link', {
                name: /@test_user/,
            })
            expect(igLink).toBeInTheDocument()
            expect(screen.queryByText(/Following:/)).not.toBeInTheDocument()
        })
    })

    describe('Instagram handle link', () => {
        it('should render with correct attributes and log event on click', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = createInstagramProfilesHandler()
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
    })

    describe('profile details', () => {
        it('should render follower information', async () => {
            const mockListInstagramProfiles = createInstagramProfilesHandler({
                business_follows_customer: true,
                customer_follows_business: false,
            })
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Following:/)).toBeInTheDocument()
                expect(screen.getByText(/Follower:/)).toBeInTheDocument()
                expect(screen.getByText('14.7k followers')).toBeInTheDocument()
            })
        })

        it('should render verified badge when user is verified', async () => {
            const mockListInstagramProfiles = createInstagramProfilesHandler({
                is_verified: true,
            })
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            const verifiedIcon = await screen.findByRole('img', {
                name: 'wavy-check',
            })
            expect(verifiedIcon).toBeInTheDocument()
        })

        it('should not render verified badge when user is not verified', async () => {
            const mockListInstagramProfiles = createInstagramProfilesHandler({
                is_verified: false,
            })
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await screen.findByRole('link', { name: /@test_user/ })

            expect(
                screen.queryByRole('img', { name: 'wavy-check' }),
            ).not.toBeInTheDocument()
        })

        it('should render Instagram name when present', async () => {
            const mockListInstagramProfiles = createInstagramProfilesHandler({
                name: 'Test User Full Name',
                total_followers: 1000,
            })
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('Test User Full Name'),
                ).toBeInTheDocument()
            })
        })

        it('should not render name section when name is not present', async () => {
            const mockListInstagramProfiles = createInstagramProfilesHandler({
                name: undefined,
                total_followers: 1000,
            })
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/Following:/)).toBeInTheDocument()
            })

            expect(screen.queryByText(/Test User/)).not.toBeInTheDocument()
        })
    })

    describe('follow relationship indicators', () => {
        it.each([
            {
                scenario: 'business follows customer',
                profileData: {
                    business_follows_customer: true,
                    customer_follows_business: false,
                },
                textToHover: /Following:/,
                expectedIcon: 'check',
                expectedTooltip:
                    'Your business follows this customer on Instagram',
            },
            {
                scenario: 'business does not follow customer',
                profileData: {
                    business_follows_customer: false,
                    customer_follows_business: true,
                },
                textToHover: /Following:/,
                expectedIcon: 'close',
                expectedTooltip:
                    "Your business doesn't follow this customer on Instagram",
            },
            {
                scenario: 'customer follows business',
                profileData: {
                    business_follows_customer: false,
                    customer_follows_business: true,
                },
                textToHover: /Follower:/,
                expectedIcon: 'check',
                expectedTooltip: 'Customer follows your business on Instagram',
            },
            {
                scenario: 'customer does not follow business',
                profileData: {
                    business_follows_customer: true,
                    customer_follows_business: false,
                },
                textToHover: /Follower:/,
                expectedIcon: 'close',
                expectedTooltip:
                    "Customer doesn't follow your business on Instagram",
            },
        ])(
            'should show correct icon and tooltip when $scenario',
            async ({
                profileData,
                textToHover,
                expectedIcon,
                expectedTooltip,
            }) => {
                const user = userEvent.setup()
                const mockListInstagramProfiles =
                    createInstagramProfilesHandler({
                        ...profileData,
                        total_followers: 1000,
                    })
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(screen.getByText(textToHover)).toBeInTheDocument()
                })

                const chevron = screen.getByRole('img', {
                    name: /arrow-chevron-down/,
                })
                await act(() => user.click(chevron))

                const icons = screen.getAllByRole('img', { name: expectedIcon })
                expect(icons.length).toBeGreaterThan(0)

                const textElement = screen.getByText(textToHover)
                await act(() => user.hover(textElement))

                await waitFor(() => {
                    expect(
                        screen.getByText(expectedTooltip),
                    ).toBeInTheDocument()
                })
            },
        )
    })

    describe('details section toggle', () => {
        it('should show chevron-down when initially collapsed', async () => {
            const mockListInstagramProfiles = createInstagramProfilesHandler()
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

        it('should toggle visibility when clicking chevron', async () => {
            const user = userEvent.setup()
            const mockListInstagramProfiles = createInstagramProfilesHandler({
                name: 'Test User',
                business_follows_customer: true,
                customer_follows_business: false,
            })
            server.use(mockListInstagramProfiles.handler)

            renderComponent()

            const chevronDown = await screen.findByRole('img', {
                name: 'arrow-chevron-down',
            })

            await act(() => user.click(chevronDown))

            await waitFor(() => {
                expect(
                    screen.getByRole('img', { name: 'arrow-chevron-up' }),
                ).toBeInTheDocument()
            })

            expect(screen.getByText('Test User')).toBeInTheDocument()
            expect(screen.getByText(/Following:/)).toBeInTheDocument()
            expect(screen.getByText('14.7k followers')).toBeInTheDocument()

            const chevronUp = screen.getByRole('img', {
                name: 'arrow-chevron-up',
            })
            await act(() => user.click(chevronUp))

            await waitFor(() => {
                expect(
                    screen.getByRole('img', { name: 'arrow-chevron-down' }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('follower count formatting', () => {
        it.each([
            {
                count: 500,
                expected: '500 followers',
                description: 'count < 1000',
            },
            {
                count: 5500,
                expected: '5.5k followers',
                description: 'count 1k-9.9k',
            },
            {
                count: 14700,
                expected: '14.7k followers',
                description: 'count 10k-99.9k',
            },
            {
                count: 150000,
                expected: '150k followers',
                description: 'count 100k-999k',
            },
            {
                count: 1500000,
                expected: '1.5M followers',
                description: 'count 1M-9.9M',
            },
            {
                count: 15000000,
                expected: '15M followers',
                description: 'count 10M+',
            },
            {
                count: 5000,
                expected: '5k followers',
                description: 'removes trailing .0',
            },
        ])(
            'should format $description as "$expected"',
            async ({ count, expected }) => {
                const mockListInstagramProfiles =
                    createInstagramProfilesHandler({
                        total_followers: count,
                    })
                server.use(mockListInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(screen.getByText(expected)).toBeInTheDocument()
                })
            },
        )
    })

    describe('message filtering (system messages and internal notes)', () => {
        it('should use the last Instagram message when the most recent message is an internal note', async () => {
            const storeWithInternalNote = createMockStore({
                integrations: [
                    {
                        id: 456,
                        type: 'facebook',
                        meta: {
                            instagram: {
                                id: 'ig_business_456',
                            },
                        },
                    },
                ],
                messages: [
                    {
                        id: 1,
                        integration_id: 456,
                        sender: {
                            name: 'customer',
                        },
                        source: {
                            type: 'instagram-direct-message',
                        },
                        created_datetime: '2024-01-01T10:00:00Z',
                    },
                    {
                        id: 2,
                        integration_id: null,
                        sender: {
                            name: 'agent',
                        },
                        source: {
                            type: 'internal-note',
                        },
                        created_datetime: '2024-01-01T11:00:00Z',
                    },
                ],
            })

            const mockListInstagramProfiles = createInstagramProfilesHandler()
            server.use(mockListInstagramProfiles.handler)

            renderComponent(storeWithInternalNote)

            // Verify the component still fetches and renders Instagram profile data
            // using the Instagram message's integration (456), not the internal note
            await waitFor(() => {
                expect(screen.getByText(/14.7k followers/)).toBeInTheDocument()
            })

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
        })

        it('should use the last Instagram message when there are multiple internal notes and system messages', async () => {
            const storeWithMultipleSystemMessages = createMockStore({
                integrations: [
                    {
                        id: 789,
                        type: 'facebook',
                        meta: {
                            instagram: {
                                id: 'ig_business_789',
                            },
                        },
                    },
                ],
                messages: [
                    {
                        id: 1,
                        integration_id: 789,
                        sender: {
                            name: 'customer',
                        },
                        source: {
                            type: 'instagram-direct-message',
                        },
                        created_datetime: '2024-01-01T09:00:00Z',
                    },
                    {
                        id: 2,
                        integration_id: null,
                        sender: {
                            name: 'agent',
                        },
                        source: {
                            type: 'internal-note',
                        },
                        created_datetime: '2024-01-01T10:00:00Z',
                    },
                    {
                        id: 3,
                        integration_id: null,
                        sender: {
                            name: 'system',
                        },
                        source: {
                            type: 'system-message',
                        },
                        created_datetime: '2024-01-01T11:00:00Z',
                    },
                    {
                        id: 4,
                        integration_id: null,
                        sender: {
                            name: 'agent',
                        },
                        source: {
                            type: 'internal-note',
                        },
                        created_datetime: '2024-01-01T12:00:00Z',
                    },
                ],
            })

            const mockListInstagramProfiles = createInstagramProfilesHandler({
                total_followers: 25000,
            })
            server.use(mockListInstagramProfiles.handler)

            renderComponent(storeWithMultipleSystemMessages)

            // Verify the component uses the Instagram message (id: 1, integration_id: 789)
            // despite multiple internal notes and system messages after it
            await waitFor(() => {
                expect(screen.getByText(/25k followers/)).toBeInTheDocument()
            })

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toBeInTheDocument()
        })

        it('should handle the case when only internal notes exist', async () => {
            const storeWithOnlyInternalNotes = createMockStore({
                messages: [
                    {
                        id: 1,
                        integration_id: null,
                        sender: {
                            name: 'agent',
                        },
                        source: {
                            type: 'internal-note',
                        },
                        created_datetime: '2024-01-01T10:00:00Z',
                    },
                ],
            })

            renderComponent(storeWithOnlyInternalNotes)

            // Should still render the basic Instagram link without profile data
            const igLink = await screen.findByRole('link', {
                name: /@test_user/,
            })
            expect(igLink).toBeInTheDocument()
            expect(screen.queryByText(/Following:/)).not.toBeInTheDocument()
        })
    })
})
