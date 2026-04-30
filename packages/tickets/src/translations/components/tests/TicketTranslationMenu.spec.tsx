import type { ReactElement } from 'react'

import { useFlag } from '@repo/feature-flags'
import { act, cleanup, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { Route, useLocation } from 'react-router-dom'

import {
    mockGetCurrentUserHandler,
    mockListTicketTranslationsHandler,
    mockTicket,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import {
    mockTranslateTicketModalContextValue,
    render as renderPrimitive,
} from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import type { CurrentUser } from '../../hooks/useCurrentUserLanguagePreferences'
import { DisplayedContent } from '../../store/constants'
import { useTicketMessageTranslationDisplay } from '../../store/useTicketMessageTranslationDisplay'
import { TicketTranslationMenu } from '../TicketTranslationMenu'

vi.mock('@repo/feature-flags', async () => {
    const actual = await vi.importActual('@repo/feature-flags')
    return {
        ...actual,
        useFlag: vi.fn(),
    }
})

const mockUseFlag = vi.mocked(useFlag)

const mockLanguagePreferencesEnglish = {
    id: 2,
    user_id: 123,
    type: UserSettingType.LanguagePreferences,
    data: {
        enabled: true,
        primary: Language.En,
        proficient: [Language.Es],
    },
}

const mockGetCurrentUserWithEnglish = mockGetCurrentUserHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            settings: [mockLanguagePreferencesEnglish],
        } as CurrentUser['data']),
)

const mockLanguagePreferencesFrench = {
    id: 2,
    user_id: 123,
    type: UserSettingType.LanguagePreferences,
    data: {
        enabled: true,
        primary: Language.Fr,
        proficient: [],
    },
}

const mockGetCurrentUserWithFrench = mockGetCurrentUserHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            settings: [mockLanguagePreferencesFrench],
        } as CurrentUser['data']),
)

const testTicket = mockTicket({ id: 1234, language: Language.Fr })

const mockTranslation = mockTicketTranslationCompact({
    ticket_id: testTicket.id,
    subject: 'Translated subject',
})

const render = (
    element: ReactElement,
    options?: Parameters<typeof renderPrimitive>[1],
) => renderPrimitive(element, options)

const mockListTicketTranslations = mockListTicketTranslationsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [mockTranslation],
        }),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockUseFlag.mockReturnValue(true)
    useTicketMessageTranslationDisplay.setState({
        ticketMessagesTranslationDisplayMap: {},
        allMessageDisplayState: DisplayedContent.Translated,
    })
    server.use(
        mockGetCurrentUserWithEnglish.handler,
        mockListTicketTranslations.handler,
    )
})

afterEach(async () => {
    cleanup()
    server.resetHandlers()
    vi.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const findTranslateButton = () =>
    screen.findByRole('button', { name: /translate/i })

const clickElement = async (
    user: ReturnType<typeof render>['user'],
    element: HTMLElement,
) => {
    await act(async () => {
        await user.click(element)
    })
}

const openTranslationMenu = async (user: ReturnType<typeof render>['user']) => {
    const translateButton = await findTranslateButton()

    if (translateButton.getAttribute('aria-expanded') !== 'true') {
        await clickElement(user, translateButton)
    }

    try {
        await screen.findByRole('menuitem', { name: /translation settings/i })
    } catch {
        await clickElement(user, translateButton)
        await screen.findByRole('menuitem', { name: /translation settings/i })
    }
}

const waitForTranslationMenuToClose = async () => {
    await waitFor(() => {
        expect(
            screen.queryByRole('menuitem', {
                name: /translation settings/i,
            }),
        ).not.toBeInTheDocument()
    })
}

describe('TicketTranslationMenu', () => {
    describe('menu button', () => {
        it('should render a translate button', async () => {
            render(<TicketTranslationMenu ticket={testTicket} />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })
        })

        it('should open menu when translate button is clicked', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            expect(
                screen.getByRole('menuitem', { name: /show original/i }),
            ).toBeInTheDocument()
        })
    })

    describe('tooltip', () => {
        it('should display tooltip with translation helper text when showing translated content', async () => {
            render(<TicketTranslationMenu ticket={testTicket} />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /Ticket translated from French/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should display tooltip with translation helper text when showing original content', async () => {
            render(<TicketTranslationMenu ticket={testTicket} />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /Ticket translated from French/i,
                    }),
                ).toBeInTheDocument()
            })

            act(() => {
                useTicketMessageTranslationDisplay.setState({
                    ticketMessagesTranslationDisplayMap: {},
                    allMessageDisplayState: DisplayedContent.Original,
                })
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /Translate ticket to English/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should update tooltip text when user language preference is French', async () => {
            const germanTicket = mockTicket({ id: 5678, language: Language.De })
            const germanTranslation = mockTicketTranslationCompact({
                ticket_id: germanTicket.id,
                subject: 'Translated German subject',
            })
            const { handler: germanHandler } =
                mockListTicketTranslationsHandler(async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [germanTranslation],
                    }),
                )
            server.use(mockGetCurrentUserWithFrench.handler, germanHandler)

            render(<TicketTranslationMenu ticket={germanTicket} />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /Ticket translated from German/i,
                    }),
                ).toBeInTheDocument()
            })

            act(() => {
                useTicketMessageTranslationDisplay.setState({
                    ticketMessagesTranslationDisplayMap: {},
                    allMessageDisplayState: DisplayedContent.Original,
                })
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /Translate ticket to French/i,
                    }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('menu items conditional display', () => {
        it('should show "Show original" when translated and "See translation" when original', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await openTranslationMenu(user)

            expect(
                await screen.findByRole('menuitem', { name: /show original/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /see translation/i }),
            ).not.toBeInTheDocument()

            await clickElement(
                user,
                screen.getByRole('menuitem', { name: /show original/i }),
            )

            await waitFor(() => {
                expect(
                    useTicketMessageTranslationDisplay.getState()
                        .allMessageDisplayState,
                ).toBe(DisplayedContent.Original)
            })
            await waitForTranslationMenuToClose()

            await openTranslationMenu(user)

            expect(
                await screen.findByRole('menuitem', {
                    name: /see translation/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /show original/i }),
            ).not.toBeInTheDocument()
        })

        it('should call setAllTicketMessagesToOriginal when "Show original" is clicked', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            const showOriginalItem = screen.getByRole('menuitem', {
                name: /show original/i,
            })

            await clickElement(user, showOriginalItem)

            const state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(DisplayedContent.Original)
        })

        it('should call setAllTicketMessagesToTranslated when "See translation" is clicked', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            act(() => {
                useTicketMessageTranslationDisplay.setState({
                    ticketMessagesTranslationDisplayMap: {},
                    allMessageDisplayState: DisplayedContent.Original,
                })
            })

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            const seeTranslationItem = screen.getByRole('menuitem', {
                name: /see translation/i,
            })

            await clickElement(user, seeTranslationItem)

            const state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(
                DisplayedContent.Translated,
            )
        })
    })

    describe('translation settings menu item', () => {
        it('should always display "Translation settings" menu item regardless of state', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            expect(
                screen.getByRole('menuitem', { name: /translation settings/i }),
            ).toBeInTheDocument()

            await clickElement(
                user,
                screen.getByRole('menuitem', { name: /show original/i }),
            )

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            expect(
                screen.getByRole('menuitem', { name: /translation settings/i }),
            ).toBeInTheDocument()
        })

        it('should display "Change source language" in the menu', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await openTranslationMenu(user)

            expect(
                screen.getByRole('menuitem', {
                    name: /change source language/i,
                }),
            ).toBeInTheDocument()
        })

        it('should open the translate ticket modal when "Change source language" is clicked', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await openTranslationMenu(user)

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

        it('should navigate to translation settings page when "Translation settings" is clicked', async () => {
            const LocationDisplay = () => {
                const location = useLocation()
                return (
                    <div data-testid="current-location">
                        {location.pathname}
                        {location.hash}
                    </div>
                )
            }

            const { user } = render(
                <>
                    <TicketTranslationMenu ticket={testTicket} />
                    <Route path="*" component={LocationDisplay} />
                </>,
                {
                    initialEntries: ['/app/tickets/123'],
                    path: '*',
                },
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            expect(screen.getByTestId('current-location')).toHaveTextContent(
                '/app/tickets/123',
            )

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            const translationSettingsItem = screen.getByRole('menuitem', {
                name: /translation settings/i,
            })

            await clickElement(user, translationSettingsItem)

            await waitFor(() => {
                expect(
                    screen.getByTestId('current-location'),
                ).toHaveTextContent(
                    '/app/settings/profile#translation-settings',
                )
            })
        })
    })

    describe('state transitions', () => {
        it('should toggle between translated and original states', async () => {
            const { user } = render(
                <TicketTranslationMenu ticket={testTicket} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            let state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(
                DisplayedContent.Translated,
            )

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            await clickElement(
                user,
                screen.getByRole('menuitem', { name: /show original/i }),
            )

            state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(DisplayedContent.Original)

            await clickElement(
                user,
                screen.getByRole('button', { name: /translate/i }),
            )

            await clickElement(
                user,
                screen.getByRole('menuitem', { name: /see translation/i }),
            )

            state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(
                DisplayedContent.Translated,
            )
        })
    })

    describe('different languages', () => {
        it('should display correct language name for German', async () => {
            const ticket = mockTicket({ id: 9999, language: Language.De })
            const translation = mockTicketTranslationCompact({
                ticket_id: ticket.id,
                subject: 'Translated German subject',
            })
            const { handler } = mockListTicketTranslationsHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: [translation],
                    }),
            )
            server.use(handler)

            render(<TicketTranslationMenu ticket={ticket} />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /Ticket translated from German/i,
                    }),
                ).toBeInTheDocument()
            })
        })
    })
})
