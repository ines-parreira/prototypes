import * as hooksImports from '@repo/hooks'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { useFlag } from 'core/flags'
import type { CurrentUser } from 'tickets/core/hooks/translations/useCurrentUserLanguagePreferences'

import { TranslationsOnboardingModal } from '../TranslationsOnboardingModal'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = useFlag as jest.Mock

const server = setupServer()
const queryClient = appQueryClient

const mockPreferences = {
    id: 1,
    type: UserSettingType.Preferences,
    data: {
        available: true,
        date_format: 'en_GB',
        time_format: '24-hour',
        prefill_best_macro: false,
        show_macros: false,
        show_macros_suggestions: true,
    },
}

const mockLanguagePreferencesWithPrimary = {
    type: UserSettingType.LanguagePreferences,
    data: {
        primary: Language.En,
        proficient: [Language.Fr],
    },
}

const mockGetCurrentUserWithLanguage = mockGetCurrentUserHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            settings: [mockPreferences, mockLanguagePreferencesWithPrimary],
        } as CurrentUser['data']),
)

const mockGetCurrentUserNoPrimary = mockGetCurrentUserHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            settings: [mockPreferences],
        } as CurrentUser['data']),
)

const defaultHandlers = [mockGetCurrentUserNoPrimary.handler]

const useLocalStorageSpy = jest.spyOn(
    hooksImports,
    'useLocalStorage',
) as jest.Mock

const renderComponent = (initialPath = '/') => {
    let currentPath = initialPath

    return {
        ...render(
            <MemoryRouter initialEntries={[initialPath]}>
                <QueryClientProvider client={queryClient}>
                    <TranslationsOnboardingModal />
                    <Route
                        path="*"
                        render={({ location }) => {
                            currentPath = location.pathname + location.hash
                            return null
                        }}
                    />
                </QueryClientProvider>
            </MemoryRouter>,
        ),
        getCurrentPath: () => currentPath,
    }
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
    useLocalStorageSpy.mockReturnValue([false, jest.fn()])
    useFlagMock.mockReturnValue(true)
    server.use(...defaultHandlers)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TranslationsOnboardingModal', () => {
    describe('modal visibility', () => {
        it('should render the modal when user has no primary language and has not seen it', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])

            renderComponent()

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })
        })

        it('should not render the modal when already seen', () => {
            useLocalStorageSpy.mockReturnValue([true, jest.fn()])

            renderComponent()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should not render the modal when user has primary language', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])
            server.use(mockGetCurrentUserWithLanguage.handler)

            renderComponent()

            await waitFor(() => {
                expect(queryClient.isFetching()).toBe(0)
            })

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should not render the modal when feature flag is disabled', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])
            useFlagMock.mockReturnValue(false)

            renderComponent()

            await waitFor(() => {
                expect(queryClient.isFetching()).toBe(0)
            })

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should wait for user data to finish fetching before showing modal', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])

            let resolveHandler: (() => void) | null = null
            const delayedPromise = new Promise<void>((resolve) => {
                resolveHandler = resolve
            })

            const { handler } = mockGetCurrentUserHandler(async ({ data }) => {
                await delayedPromise
                return HttpResponse.json({
                    ...data,
                    settings: [mockPreferences],
                } as CurrentUser['data'])
            })
            server.use(handler)

            renderComponent()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

            // @ts-expect-error - resolveHandler is actually callable
            resolveHandler?.()

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })
        })
    })

    describe('modal content', () => {
        it('should render all modal elements correctly', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            expect(
                screen.getByText('New! Handle conversations in any language'),
            ).toBeInTheDocument()
            expect(screen.getByText(/Set up your/)).toBeInTheDocument()
            expect(
                screen.getByText('Ticket translation settings'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /and Gorgias will automatically translate incoming messages/,
                ),
            ).toBeInTheDocument()

            const images = screen.getAllByAltText(
                'A visualization of the translation feature',
            )
            expect(images).toHaveLength(2)
            expect(images[0]).toHaveAttribute('src')
            expect(images[1]).toHaveAttribute('src')

            expect(
                screen.getByRole('button', { name: 'Setup' }),
            ).toBeInTheDocument()

            const learnMoreLink = screen.getByRole('link', {
                name: /Learn more/i,
            })
            expect(learnMoreLink).toHaveAttribute(
                'href',
                'https://docs.gorgias.com/en-US/2518007-0222a844fe7141adbd957eb1d8988e43',
            )
            expect(learnMoreLink).toHaveAttribute('target', '_blank')
            expect(learnMoreLink).toHaveAttribute('rel', 'noopener noreferrer')

            const closeButton = screen
                .getAllByRole('button')
                .find((button) =>
                    button
                        .querySelector('.material-icons')
                        ?.textContent?.includes('close'),
                )
            expect(closeButton).toBeInTheDocument()
        })
    })

    describe('user interactions', () => {
        it('should close modal, mark as seen, and navigate when Setup button is clicked', async () => {
            const user = userEvent.setup()
            const setHasSeenModal = jest.fn()
            useLocalStorageSpy.mockReturnValue([false, setHasSeenModal])

            const { getCurrentPath } = renderComponent()

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            const setupButton = screen.getByRole('button', { name: 'Setup' })
            await user.click(setupButton)

            await waitFor(() => {
                expect(setHasSeenModal).toHaveBeenCalledWith(true)
                expect(getCurrentPath()).toBe(
                    '/app/settings/profile#translation-settings',
                )
            })
        })

        it('should close modal and mark as seen when close button is clicked', async () => {
            const user = userEvent.setup()
            const setHasSeenModal = jest.fn()
            useLocalStorageSpy.mockReturnValue([false, setHasSeenModal])

            renderComponent()

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            const closeButton = screen
                .getAllByRole('button')
                .find((button) =>
                    button
                        .querySelector('.material-icons')
                        ?.textContent?.includes('close'),
                )
            await user.click(closeButton!)

            await waitFor(() => {
                expect(setHasSeenModal).toHaveBeenCalledWith(true)
            })
        })
    })

    describe('local storage persistence', () => {
        it('should use correct local storage key', async () => {
            renderComponent()

            await waitFor(() => {
                expect(useLocalStorageSpy).toHaveBeenCalledWith(
                    'ai-translations-onboarding-modal-shown',
                    false,
                )
            })
        })
    })
})
