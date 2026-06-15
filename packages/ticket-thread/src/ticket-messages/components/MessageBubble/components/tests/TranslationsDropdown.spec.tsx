import type * as TicketsModule from '@repo/tickets'
import {
    DisplayedContent,
    FetchingState,
    useCurrentUserLanguagePreferences,
    useRegenerateTicketMessageTranslations,
    useTicketMessageTranslationDisplay,
    useTicketMessageTranslations,
} from '@repo/tickets'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockGetTicketHandler, mockTicket } from '@gorgias/helpdesk-mocks'

import {
    mockTranslateTicketModalContextValue,
    render,
} from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'
import * as ExpandedMessagesModule from '../../../../context/ExpandedMessages'
import { TranslationsDropdown } from '../TranslationsDropdown'

vi.mock('@repo/tickets', async () => {
    const actual = await vi.importActual<typeof TicketsModule>('@repo/tickets')
    return {
        ...actual,
        useCurrentUserLanguagePreferences: vi.fn(),
        useTicketMessageTranslations: vi.fn(),
        useRegenerateTicketMessageTranslations: vi.fn(),
    }
})

const mockUseCurrentUserLanguagePreferences = vi.mocked(
    useCurrentUserLanguagePreferences,
)
const mockUseTicketMessageTranslations = vi.mocked(useTicketMessageTranslations)
const mockUseRegenerateTicketMessageTranslations = vi.mocked(
    useRegenerateTicketMessageTranslations,
)
const mockUseExpandedMessages = vi.spyOn(
    ExpandedMessagesModule,
    'useExpandedMessages',
)

const regenerateTicketMessageTranslations = vi.fn()

const ticketId = 123
const messageId = 456
const mockTranslation = {
    ticket_message_id: messageId,
} as unknown as ReturnType<
    typeof useTicketMessageTranslations
>['ticketMessagesTranslationMap'][number]

function renderComponent() {
    return render(
        <TranslationsDropdown messageId={messageId} ticketId={ticketId} />,
    )
}

async function clickElement(
    user: ReturnType<typeof renderComponent>['user'],
    element: HTMLElement,
) {
    await act(async () => {
        await user.click(element)
    })
}

beforeEach(() => {
    regenerateTicketMessageTranslations.mockReset()
    server.use(
        mockGetTicketHandler(async () =>
            HttpResponse.json(
                mockTicket({
                    id: ticketId,
                    language: 'es',
                }),
            ),
        ).handler,
    )

    mockUseCurrentUserLanguagePreferences.mockReturnValue({
        isFetching: false,
        isEnabled: false,
        primary: undefined,
        proficient: undefined,
        shouldShowTranslatedContent: vi.fn(() => true),
    })

    mockUseTicketMessageTranslations.mockReturnValue({
        ticketMessagesTranslationMap: {
            [messageId]: mockTranslation,
        },
        getMessageTranslation: vi.fn(() => mockTranslation),
    })

    mockUseRegenerateTicketMessageTranslations.mockReturnValue({
        regenerateTicketMessageTranslations,
    } as ReturnType<typeof useRegenerateTicketMessageTranslations>)

    mockUseExpandedMessages.mockReturnValue({
        isMessageExpanded: () => false,
        expandedMessageIds: [],
        toggleMessage: vi.fn(),
    })

    useTicketMessageTranslationDisplay.setState({
        ticketMessagesTranslationDisplayMap: {
            [messageId]: {
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
            },
        },
        allMessageDisplayState: DisplayedContent.Translated,
    })
})

afterEach(() => {
    vi.clearAllMocks()
})

describe('TranslationsDropdown', () => {
    async function findTranslatedButton() {
        return screen.findByRole(
            'button',
            {
                name: /translated/i,
            },
            {
                timeout: 10000,
            },
        )
    }

    async function findTranslatedFromSpanishButton() {
        return screen.findByRole(
            'button',
            {
                name: /translated from spanish/i,
            },
            {
                timeout: 10000,
            },
        )
    }

    describe('Original content display', () => {
        it('should render "See translation" button', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /see translation/i }),
                ).toBeInTheDocument()
            })
        })

        it('should switch to translated when "See translation" is clicked', async () => {
            const { user } = renderComponent()

            await clickElement(
                user,
                await screen.findByRole('button', { name: /see translation/i }),
            )

            const state = useTicketMessageTranslationDisplay.getState()
            expect(state.getTicketMessageTranslationDisplay(messageId)).toEqual(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: false,
                    messageId,
                },
            )
        })
    })

    describe('Translated content display', () => {
        beforeEach(() => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [messageId]: {
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                        hasRegeneratedOnce: false,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
        })

        it('should show dropdown with language name', async () => {
            renderComponent()

            expect(await findTranslatedFromSpanishButton()).toBeInTheDocument()
        })

        it('should show dropdown menu options when opened', async () => {
            const { user } = renderComponent()

            await clickElement(user, await findTranslatedFromSpanishButton())

            expect(
                await screen.findByRole('menuitem', { name: /show original/i }),
            ).toBeInTheDocument()
            expect(
                await screen.findByRole('menuitem', {
                    name: /regenerate translation/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', {
                    name: /change source language/i,
                }),
            ).toBeInTheDocument()
        })

        it('should switch to original when "Show original" is clicked', async () => {
            const { user } = renderComponent()

            await clickElement(user, await findTranslatedFromSpanishButton())
            await clickElement(
                user,
                await screen.findByRole('menuitem', { name: /show original/i }),
            )

            const state = useTicketMessageTranslationDisplay.getState()
            expect(state.getTicketMessageTranslationDisplay(messageId)).toEqual(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                    messageId,
                },
            )
        })

        it('should open the translate ticket modal when "Change source language" is clicked', async () => {
            const { user } = renderComponent()

            await clickElement(
                user,
                await screen.findByRole('button', {
                    name: /translated from spanish/i,
                }),
            )
            await clickElement(
                user,
                screen.getByRole('menuitem', {
                    name: /change source language/i,
                }),
            )

            expect(
                mockTranslateTicketModalContextValue.openTranslateTicketModal,
            ).toHaveBeenCalledTimes(1)
        })
    })

    describe('Loading and error states', () => {
        it('should show loading state', () => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [messageId]: {
                        display: DisplayedContent.Original,
                        fetchingState: FetchingState.Loading,
                        hasRegeneratedOnce: false,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })

            renderComponent()

            return waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translating/i }),
                ).toBeDisabled()
            })
        })

        it('should show TranslationLimit when failed with hasRegeneratedOnce', () => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [messageId]: {
                        display: DisplayedContent.Original,
                        fetchingState: FetchingState.Failed,
                        hasRegeneratedOnce: true,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })

            renderComponent()

            expect(
                screen.getByText('Regeneration limit reached'),
            ).toBeInTheDocument()
        })
    })

    describe('Regeneration', () => {
        beforeEach(() => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [messageId]: {
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                        hasRegeneratedOnce: false,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
        })

        it('should call regenerate with correct messageId and close dropdown', async () => {
            const { user } = renderComponent()

            await clickElement(user, await findTranslatedButton())
            await clickElement(
                user,
                await screen.findByRole('menuitem', {
                    name: /regenerate translation/i,
                }),
            )

            expect(regenerateTicketMessageTranslations).toHaveBeenCalledWith(
                messageId,
            )
        })

        it('should disable re-generate button when hasRegeneratedOnce is true', async () => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [messageId]: {
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                        hasRegeneratedOnce: true,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })

            const { user } = renderComponent()

            await clickElement(user, await findTranslatedButton())

            expect(
                await screen.findByRole('menuitem', {
                    name: /regenerate translation/i,
                }),
            ).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Ticket language handling', () => {
        beforeEach(() => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [messageId]: {
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                        hasRegeneratedOnce: false,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
        })

        it('should hide language text when ticket has no language', () => {
            server.use(
                mockGetTicketHandler(async () =>
                    HttpResponse.json(
                        mockTicket({
                            id: ticketId,
                            language: undefined,
                        }),
                    ),
                ).handler,
            )

            renderComponent()

            return waitFor(() => {
                expect(
                    screen.queryByRole('button', {
                        name: /translated from/i,
                    }),
                ).not.toBeInTheDocument()
                expect(
                    screen.getByRole('button', { name: /translated/i }),
                ).toBeInTheDocument()
            })
        })

        it('should still allow dropdown actions when ticket has no language', async () => {
            server.use(
                mockGetTicketHandler(async () =>
                    HttpResponse.json(
                        mockTicket({
                            id: ticketId,
                            language: undefined,
                        }),
                    ),
                ).handler,
            )

            const { user } = renderComponent()

            await clickElement(
                user,
                await screen.findByRole('button', { name: /translated/i }),
            )

            expect(
                screen.getByRole('menuitem', { name: /show original/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', {
                    name: /regenerate translation/i,
                }),
            ).toBeInTheDocument()
        })
    })

    describe('Guard clauses', () => {
        it('does not render when translated content should not be shown', () => {
            mockUseCurrentUserLanguagePreferences.mockReturnValue({
                isFetching: false,
                isEnabled: false,
                primary: undefined,
                proficient: undefined,
                shouldShowTranslatedContent: vi.fn(() => false),
            })

            const { container } = renderComponent()

            expect(container).toBeEmptyDOMElement()
        })

        it('does not render when the message is expanded', () => {
            mockUseExpandedMessages.mockReturnValue({
                isMessageExpanded: () => true,
                expandedMessageIds: [],
                toggleMessage: vi.fn(),
            })

            const { container } = renderComponent()

            expect(container).toBeEmptyDOMElement()
        })
    })
})
