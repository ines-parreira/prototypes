import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Route, useLocation } from 'react-router-dom'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import type { CurrentUser } from '../../hooks/useCurrentUserLanguagePreferences'
import { DisplayedContent } from '../../store/constants'
import { useTicketMessageTranslationDisplay } from '../../store/useTicketMessageTranslationDisplay'
import { TicketTranslationMenu } from '../TicketTranslationMenu'

const server = setupServer()

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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    useTicketMessageTranslationDisplay.setState({
        ticketMessagesTranslationDisplayMap: {},
        allMessageDisplayState: DisplayedContent.Translated,
    })
    testAppQueryClient.clear()
    server.use(mockGetCurrentUserWithEnglish.handler)
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('TicketTranslationMenu', () => {
    describe('menu button', () => {
        it('should render a translate button', async () => {
            render(<TicketTranslationMenu language={Language.Fr} />)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })
        })

        it('should open menu when translate button is clicked', async () => {
            const { user } = render(
                <TicketTranslationMenu language={Language.Fr} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            expect(
                screen.getByRole('menuitem', { name: /show original/i }),
            ).toBeInTheDocument()
        })
    })

    describe('tooltip', () => {
        it('should display tooltip with translation helper text when showing translated content', async () => {
            const { user } = render(
                <TicketTranslationMenu language={Language.Fr} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.hover(screen.getByRole('button', { name: /translate/i })),
            )

            await waitFor(() => {
                expect(
                    screen.getByText(/Ticket translated from French/i),
                ).toBeInTheDocument()
            })
        })

        it('should display tooltip with translation helper text when showing original content', async () => {
            const { user } = render(
                <TicketTranslationMenu language={Language.Fr} />,
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

            await act(() =>
                user.hover(screen.getByRole('button', { name: /translate/i })),
            )

            await waitFor(() => {
                expect(
                    screen.getByText(/Translate ticket to English/i),
                ).toBeInTheDocument()
            })
        })

        it('should update tooltip text when user language preference is French', async () => {
            server.use(mockGetCurrentUserWithFrench.handler)

            const { user } = render(
                <TicketTranslationMenu language={Language.De} />,
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

            await act(() =>
                user.hover(screen.getByRole('button', { name: /translate/i })),
            )

            await waitFor(() => {
                expect(
                    screen.getByText(/Translate ticket to French/i),
                ).toBeInTheDocument()
            })
        })
    })

    describe('menu items conditional display', () => {
        it('should show "Show original" when translated and "See translation" when original', async () => {
            const { user } = render(
                <TicketTranslationMenu language={Language.Fr} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            expect(
                screen.getByRole('menuitem', { name: /show original/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /see translation/i }),
            ).not.toBeInTheDocument()

            await act(() =>
                user.click(
                    screen.getByRole('menuitem', { name: /show original/i }),
                ),
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            expect(
                screen.getByRole('menuitem', { name: /see translation/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('menuitem', { name: /show original/i }),
            ).not.toBeInTheDocument()
        })

        it('should call setAllTicketMessagesToOriginal when "Show original" is clicked', async () => {
            const { user } = render(
                <TicketTranslationMenu language={Language.Fr} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            const showOriginalItem = screen.getByRole('menuitem', {
                name: /show original/i,
            })

            await act(() => user.click(showOriginalItem))

            const state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(DisplayedContent.Original)
        })

        it('should call setAllTicketMessagesToTranslated when "See translation" is clicked', async () => {
            const { user } = render(
                <TicketTranslationMenu language={Language.Fr} />,
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

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            const seeTranslationItem = screen.getByRole('menuitem', {
                name: /see translation/i,
            })

            await act(() => user.click(seeTranslationItem))

            const state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(
                DisplayedContent.Translated,
            )
        })
    })

    describe('translation settings menu item', () => {
        it('should always display "Translation settings" menu item regardless of state', async () => {
            const { user } = render(
                <TicketTranslationMenu language={Language.Fr} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /translate/i }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            expect(
                screen.getByRole('menuitem', { name: /translation settings/i }),
            ).toBeInTheDocument()

            await act(() =>
                user.click(
                    screen.getByRole('menuitem', { name: /show original/i }),
                ),
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            expect(
                screen.getByRole('menuitem', { name: /translation settings/i }),
            ).toBeInTheDocument()
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
                    <TicketTranslationMenu language={Language.Fr} />
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

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            const translationSettingsItem = screen.getByRole('menuitem', {
                name: /translation settings/i,
            })

            await act(() => user.click(translationSettingsItem))

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
                <TicketTranslationMenu language={Language.Fr} />,
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

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            await act(() =>
                user.click(
                    screen.getByRole('menuitem', { name: /show original/i }),
                ),
            )

            state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(DisplayedContent.Original)

            await act(() =>
                user.click(screen.getByRole('button', { name: /translate/i })),
            )

            await act(() =>
                user.click(
                    screen.getByRole('menuitem', { name: /see translation/i }),
                ),
            )

            state = useTicketMessageTranslationDisplay.getState()
            expect(state.allMessageDisplayState).toBe(
                DisplayedContent.Translated,
            )
        })
    })

    describe('different languages', () => {
        it.each([
            { language: Language.De, languageName: 'German' },
            { language: Language.Es, languageName: 'Spanish' },
            { language: Language.Ja, languageName: 'Japanese' },
        ])(
            'should display correct language name for $languageName',
            async ({ language, languageName }) => {
                const { user } = render(
                    <TicketTranslationMenu language={language} />,
                )

                await waitFor(() => {
                    expect(
                        screen.getByRole('button', { name: /translate/i }),
                    ).toBeInTheDocument()
                })

                await act(() =>
                    user.hover(
                        screen.getByRole('button', { name: /translate/i }),
                    ),
                )

                await waitFor(() => {
                    expect(
                        screen.getByText(
                            new RegExp(
                                `Ticket translated from ${languageName}`,
                                'i',
                            ),
                        ),
                    ).toBeInTheDocument()
                })
            },
        )
    })
})
