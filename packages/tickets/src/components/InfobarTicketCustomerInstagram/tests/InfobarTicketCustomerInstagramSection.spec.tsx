import { logEvent, SegmentEvent } from '@repo/logging'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockInstagramProfile,
    mockIntegration,
    mockListInstagramProfilesHandler,
    mockListIntegrationsHandler,
    mockTicketCustomer,
    mockTicketCustomerChannel,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomer, TicketMessage } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { InfobarTicketCustomerInstagramSection } from '../InfobarTicketCustomerInstagramSection'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        InstagramHandleClicked: 'Instagram Handle Clicked',
    },
}))

const server = setupServer()

const mockFacebookIntegration = mockIntegration({
    id: 123,
    type: 'facebook',
    name: 'Facebook Integration',
    created_datetime: '2024-01-01T00:00:00Z',
    meta: {
        instagram: {
            id: 'ig_business_123',
        },
    },
})

const mockListIntegrations = mockListIntegrationsHandler(async () =>
    HttpResponse.json({
        data: [mockFacebookIntegration],
        meta: {
            next_cursor: null,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/integrations',
    }),
)

const mockInstagramChannel = mockTicketCustomerChannel({
    type: 'instagram',
    address: 'test_user',
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-06-01T00:00:00Z',
})

const createMockCustomer = (
    overrides?: Partial<TicketCustomer>,
): TicketCustomer =>
    mockTicketCustomer({
        id: 1,
        name: 'test_user',
        email: 'test@example.com',
        channels: [mockInstagramChannel],
        ...overrides,
    })

const createMockMessages = (
    overrides?: Partial<TicketMessage>[],
): TicketMessage[] => {
    if (overrides) {
        return overrides.map(
            (override, index) =>
                ({
                    id: index + 1,
                    integration_id: 123,
                    sender: {
                        name: 'test_user',
                    },
                    ...override,
                }) as TicketMessage,
        )
    }
    return [
        {
            id: 1,
            integration_id: 123,
            sender: {
                name: 'test_user',
            },
        } as TicketMessage,
    ]
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
                    updated_at: '2024-06-15T10:30:00Z',
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

const renderComponent = (
    customer: TicketCustomer = createMockCustomer(),
    messages: TicketMessage[] = createMockMessages(),
) => {
    return render(
        <InfobarTicketCustomerInstagramSection
            customer={customer}
            messages={messages}
        />,
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListIntegrations.handler)
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
    vi.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('InfobarTicketCustomerInstagramSection', () => {
    describe('when customer handle is not available', () => {
        it('should return null when customer has no channels', () => {
            const { container } = renderComponent(
                createMockCustomer({ channels: [] }),
            )

            expect(container.firstChild).toBeNull()
        })

        it('should return null when customer has no instagram channel', () => {
            const emailChannel = mockTicketCustomerChannel({
                type: 'email',
                address: 'test@example.com',
            })

            const { container } = renderComponent(
                createMockCustomer({ channels: [emailChannel] }),
            )

            expect(container.firstChild).toBeNull()
        })

        it('should use the most recently updated instagram channel', async () => {
            const mockEmptyInstagramProfiles = mockListInstagramProfilesHandler(
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
            server.use(mockEmptyInstagramProfiles.handler)

            const olderChannel = mockTicketCustomerChannel({
                type: 'instagram',
                address: 'old_user',
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-06-01T00:00:00Z',
            })
            const newerChannel = mockTicketCustomerChannel({
                type: 'instagram',
                address: 'new_user',
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-06-01T00:00:00Z',
            })

            renderComponent(
                createMockCustomer({
                    channels: [olderChannel, newerChannel],
                }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('link', { name: /@new_user/ }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('when Instagram profile is not available', () => {
        it('should render basic handle link when profile API returns empty', async () => {
            const mockEmptyInstagramProfiles = mockListInstagramProfilesHandler(
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
            server.use(mockEmptyInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Instagram' }),
                ).toBeInTheDocument()
            })

            const igLink = screen.getByRole('link', { name: /@test_user/ })
            expect(igLink).toHaveAttribute(
                'href',
                'https://www.instagram.com/test_user',
            )

            expect(screen.queryByText('Followers')).not.toBeInTheDocument()
            expect(screen.queryByText('Following you')).not.toBeInTheDocument()
        })
    })

    describe('Instagram handle link', () => {
        it('should render with correct attributes', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler()
            server.use(mockInstagramProfiles.handler)

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
        })

        it('should log event when clicked', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler()
            server.use(mockInstagramProfiles.handler)

            const { user } = renderComponent()

            const igLink = await screen.findByRole('link', {
                name: /@test_user/,
            })

            await act(() => user.click(igLink))

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.InstagramHandleClicked,
            )
        })
    })

    describe('profile details', () => {
        it('should render section heading', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler()
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Instagram' }),
                ).toBeInTheDocument()
            })
        })

        it('should render follower count', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                total_followers: 14700,
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('14.7k')).toBeInTheDocument()
            })
        })

        it('should render verified badge when user is verified', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                is_verified: true,
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            const verifiedIcon = await screen.findByRole('img', {
                name: 'wavy-check',
            })
            expect(verifiedIcon).toBeInTheDocument()
        })

        it('should not render verified badge when user is not verified', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                is_verified: false,
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await screen.findByRole('link', { name: /@test_user/ })

            expect(
                screen.queryByRole('img', { name: 'wavy-check' }),
            ).not.toBeInTheDocument()
        })

        it('should render profile name when present', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                name: 'Test User Full Name',
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('Test User Full Name'),
                ).toBeInTheDocument()
            })
        })

        it('should render "Following you" as Yes when customer follows business', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                customer_follows_business: true,
                business_follows_customer: false,
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Following you')).toBeInTheDocument()
            })

            const followingYouLabel = screen.getByText('Following you')
            const row = followingYouLabel.closest('div')?.parentElement
            expect(row).toHaveTextContent('Yes')
        })

        it('should render "Following you" as No when customer does not follow business', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                customer_follows_business: false,
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Following you')).toBeInTheDocument()
            })

            const followingYouLabel = screen.getByText('Following you')
            const row = followingYouLabel.closest('div')?.parentElement
            expect(row).toHaveTextContent('No')
        })

        it('should render "Followed by you" as Yes when business follows customer', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                business_follows_customer: true,
                customer_follows_business: false,
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Followed by you')).toBeInTheDocument()
            })

            const followedByYouLabel = screen.getByText('Followed by you')
            const row = followedByYouLabel.closest('div')?.parentElement
            expect(row).toHaveTextContent('Yes')
        })

        it('should render "Followed by you" as No when business does not follow customer', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                business_follows_customer: false,
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Followed by you')).toBeInTheDocument()
            })

            const followedByYouLabel = screen.getByText('Followed by you')
            const row = followedByYouLabel.closest('div')?.parentElement
            expect(row).toHaveTextContent('No')
        })

        it('should render profile updated at date', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                updated_at: '2024-06-15T10:30:00Z',
            })
            server.use(mockInstagramProfiles.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('Profile updated at'),
                ).toBeInTheDocument()
                expect(screen.getByText('15/06/2024')).toBeInTheDocument()
            })
        })
    })

    describe('OverflowList', () => {
        it('should render with OverflowList component', async () => {
            const mockInstagramProfiles = createInstagramProfilesHandler({
                name: 'Test User',
            })
            server.use(mockInstagramProfiles.handler)

            const { container } = renderComponent()

            await waitFor(() => {
                const overflowList = container.querySelector(
                    '[data-name="overflow-list"]',
                )
                expect(overflowList).toBeInTheDocument()
            })
        })
    })

    describe('follower count formatting', () => {
        it.each([
            {
                count: 500,
                expected: '500',
                description: 'count < 1000',
            },
            {
                count: 5500,
                expected: '5.5k',
                description: 'count 1k-9.9k',
            },
            {
                count: 5000,
                expected: '5k',
                description: 'removes trailing .0 for 1k-9.9k',
            },
            {
                count: 14700,
                expected: '14.7k',
                description: 'count 10k-99.9k',
            },
            {
                count: 10000,
                expected: '10k',
                description: 'removes trailing .0 for 10k-99.9k',
            },
            {
                count: 150000,
                expected: '150k',
                description: 'count 100k-999k',
            },
            {
                count: 1500000,
                expected: '1.5M',
                description: 'count 1M-9.9M',
            },
            {
                count: 1000000,
                expected: '1M',
                description: 'removes trailing .0 for 1M-9.9M',
            },
            {
                count: 15000000,
                expected: '15M',
                description: 'count 10M+',
            },
        ])(
            'should format $description as "$expected"',
            async ({ count, expected }) => {
                const mockInstagramProfiles = createInstagramProfilesHandler({
                    total_followers: count,
                })
                server.use(mockInstagramProfiles.handler)

                renderComponent()

                await waitFor(() => {
                    expect(screen.getByText(expected)).toBeInTheDocument()
                })
            },
        )
    })
})
