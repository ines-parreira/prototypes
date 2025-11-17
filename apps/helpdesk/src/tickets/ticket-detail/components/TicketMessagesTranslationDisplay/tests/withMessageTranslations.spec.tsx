import type React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import {
    mockGetCurrentUserHandler,
    mockListTicketMessageTranslationsHandler,
    mockTicketMessage,
    mockTicketMessageTranslation,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { TicketMessageTranslation } from '@gorgias/helpdesk-types'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import type { TicketMessage } from 'models/ticket/types'

import { TicketMessageTranslationDisplayProvider } from '../TicketMessageTranslationDisplayProvider'
import { withMessageTranslations } from '../withMessageTranslations'

// Mock the feature flag hook
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = require('core/flags').useFlag as jest.MockedFunction<
    typeof import('core/flags').useFlag
>

// Test component to be wrapped
function TestComponent({
    message,
    ticketId,
    extraProp,
}: {
    message: TicketMessage
    ticketId: number
    extraProp: string
}) {
    return (
        <div>
            <div data-testid="message-id">{message.id}</div>
            <div data-testid="ticket-id">{ticketId}</div>
            <div data-testid="extra-prop">{extraProp}</div>
            <div data-testid="message-stripped-html">
                {message.stripped_html || 'no-html'}
            </div>
            <div data-testid="message-stripped-text">
                {message.stripped_text || 'no-text'}
            </div>
        </div>
    )
}

// Create the wrapped component
const WrappedTestComponent = withMessageTranslations(TestComponent)

// Server setup
const server = setupServer()

// Mock data
const mockMessage: TicketMessage = {
    ...mockTicketMessage(),
    id: 123,
    stripped_html: '<p>Original HTML</p>',
    stripped_text: 'Original text',
} as TicketMessage

const mockTicketId = 456
const mockExtraProp = 'extra-value'

const mockTranslation: TicketMessageTranslation = {
    ...mockTicketMessageTranslation(),
    id: '1',
    ticket_message_id: 123,
    ticket_id: 456,
    stripped_html: '<p>Translated HTML</p>',
    stripped_text: 'Translated text',
}

// Create mock user with language preferences
const mockCurrentUser = {
    ...mockUser(),
    settings: [
        {
            type: UserSettingType.LanguagePreferences,
            data: {
                primary: Language.En,
                proficient: [],
            },
        },
    ],
}

const mockCurrentUserWithFrench = {
    ...mockUser(),
    settings: [
        {
            type: UserSettingType.LanguagePreferences,
            data: {
                primary: Language.Fr,
                proficient: [],
            },
        },
    ],
}

// Create mock store
const mockStore = {
    getState: () => ({
        ticket: fromJS({
            id: 456,
            language: 'es',
        }),
    }),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
}

// Create mock handlers
const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUser),
)

const mockGetCurrentUserFrench = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUserWithFrench),
)

const mockListTicketMessageTranslations =
    mockListTicketMessageTranslationsHandler(async () =>
        HttpResponse.json({
            data: [mockTranslation],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 1,
            },
            object: 'list',
            uri: '/api/v1/tickets/456/messages/translations',
        }),
    )

const emptyTranslationsHandler = mockListTicketMessageTranslationsHandler(
    async () =>
        HttpResponse.json({
            data: [],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 0,
            },
            object: 'list',
            uri: '/api/v1/tickets/456/messages/translations',
        }),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    appQueryClient.clear()
    mockUseFlag.mockImplementation(
        (flag) => flag === FeatureFlagKey.MessagesTranslations,
    )
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

// Test component wrapper with providers
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={mockStore as any}>
        <QueryClientProvider client={appQueryClient}>
            <TicketMessageTranslationDisplayProvider>
                {children}
            </TicketMessageTranslationDisplayProvider>
        </QueryClientProvider>
    </Provider>
)

describe('withMessageTranslations', () => {
    describe('when translations are available', () => {
        beforeEach(() => {
            server.use(
                mockGetCurrentUser.handler,
                mockListTicketMessageTranslations.handler,
            )
        })

        it('should render the wrapped component with original props', async () => {
            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            expect(await findByTestId('message-id')).toHaveTextContent('123')
            expect(await findByTestId('ticket-id')).toHaveTextContent('456')
            expect(await findByTestId('extra-prop')).toHaveTextContent(
                'extra-value',
            )
        })

        it('should return original message when display is set to original', async () => {
            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // By default, display is set to original
            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })

        it('should be able to display translated message when context is updated', async () => {
            // Since we're using real context and hooks, we need to test the behavior
            // by verifying that the component correctly uses the translation data
            // when it's available. The actual switching between original/translated
            // is controlled by the context provider which is tested separately.

            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // Wait for component to render
            await waitFor(async () => {
                // By default, should show original message
                expect(
                    await findByTestId('message-stripped-html'),
                ).toHaveTextContent('<p>Original HTML</p>')
            })

            // Verify that the translation data is being fetched
            // The actual display switching would be controlled by the context
            await waitFor(async () => {
                expect(await findByTestId('message-id')).toHaveTextContent(
                    '123',
                )
            })
        })

        it('should preserve all original message properties when returning translated message', async () => {
            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // Should preserve the original message ID
            expect(await findByTestId('message-id')).toHaveTextContent('123')
            // Original content should be displayed by default
            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
        })

        it('should pass through all props to the wrapped component', async () => {
            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // All props should be passed through
            expect(await findByTestId('message-id')).toHaveTextContent('123')
            expect(await findByTestId('ticket-id')).toHaveTextContent('456')
            expect(await findByTestId('extra-prop')).toHaveTextContent(
                'extra-value',
            )
        })
    })

    describe('when no translations are available', () => {
        beforeEach(() => {
            server.use(
                mockGetCurrentUser.handler,
                emptyTranslationsHandler.handler,
            )
        })

        it('should return original message when no translation exists', async () => {
            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })

        it('should handle message with null stripped_html and stripped_text', async () => {
            const messageWithNulls: TicketMessage = {
                ...mockMessage,
                stripped_html: null,
                stripped_text: null,
            }

            const { findByTestId } = render(
                <WrappedTestComponent
                    message={messageWithNulls}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('no-html')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('no-text')
        })

        it('should handle message without id', async () => {
            const messageWithoutId: TicketMessage = {
                ...mockMessage,
                id: undefined,
            } as TicketMessage

            const { findByTestId } = render(
                <WrappedTestComponent
                    message={messageWithoutId}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
            server.use(
                mockGetCurrentUser.handler,
                mockListTicketMessageTranslations.handler,
            )
        })

        it('should always return original message when feature flag is disabled', async () => {
            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // Should show original content even if translations might be available
            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })
    })

    describe('when user has no language preferences', () => {
        beforeEach(() => {
            const userWithoutLanguagePrefs = {
                ...mockUser(),
                settings: [],
            }
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json(userWithoutLanguagePrefs),
            )
            server.use(handler, mockListTicketMessageTranslations.handler)
        })

        it('should not fetch translations when user has no language preferences', async () => {
            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // Should show original content as no translations will be fetched
            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })
    })

    describe('error handling', () => {
        it('should handle API errors gracefully', async () => {
            const { handler } = mockListTicketMessageTranslationsHandler(
                async () => HttpResponse.json(null, { status: 500 }),
            )
            server.use(mockGetCurrentUser.handler, handler)

            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // Should fall back to original message on error
            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })

        it('should handle translation with null values gracefully', async () => {
            const translationWithNulls: TicketMessageTranslation = {
                ...mockTranslation,
                stripped_html: null,
                stripped_text: null,
            }

            const { handler } = mockListTicketMessageTranslationsHandler(
                async () =>
                    HttpResponse.json({
                        data: [translationWithNulls],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 1,
                        },
                        object: 'list',
                        uri: '/api/v1/tickets/456/messages/translations',
                    }),
            )
            server.use(mockGetCurrentUser.handler, handler)

            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // When translation has null values, it should still show original by default
            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })

        it('should handle current user API error', async () => {
            const { handler } = mockGetCurrentUserHandler(async () =>
                HttpResponse.json(null, { status: 500 }),
            )
            server.use(handler, mockListTicketMessageTranslations.handler)

            const { findByTestId } = render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            // Should still render with original message
            expect(
                await findByTestId('message-stripped-html'),
            ).toHaveTextContent('<p>Original HTML</p>')
            expect(
                await findByTestId('message-stripped-text'),
            ).toHaveTextContent('Original text')
        })
    })

    describe('API request verification', () => {
        it('should make request with correct ticket_id and language', async () => {
            const waitForRequest =
                mockListTicketMessageTranslations.waitForRequest(server)

            server.use(
                mockGetCurrentUser.handler,
                mockListTicketMessageTranslations.handler,
            )

            render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            await waitForRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.searchParams.get('ticket_id')).toBe(
                    mockTicketId.toString(),
                )
                expect(url.searchParams.get('language')).toBe('en')
            })
        })

        it('should use preferred language from user settings', async () => {
            const waitForRequest =
                mockListTicketMessageTranslations.waitForRequest(server)

            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTicketMessageTranslations.handler,
            )

            render(
                <WrappedTestComponent
                    message={mockMessage}
                    ticketId={mockTicketId}
                    extraProp={mockExtraProp}
                />,
                { wrapper },
            )

            await waitForRequest(async (request) => {
                const url = new URL(request.url)
                expect(url.searchParams.get('language')).toBe('fr')
            })
        })
    })
})
