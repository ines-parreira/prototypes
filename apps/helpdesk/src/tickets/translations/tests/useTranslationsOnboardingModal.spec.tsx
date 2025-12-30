import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import * as hooksImports from '@repo/hooks'
import type { CurrentUser } from '@repo/tickets'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'

import { useTranslationsOnboardingModal } from '../useTranslationsOnboardingModal'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
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

const mockGetCurrentUserNoSettings = mockGetCurrentUserHandler(
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

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

describe('useTranslationsOnboardingModal', () => {
    describe('modal visibility logic', () => {
        it('should open modal when user has no primary language and has not seen it', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])

            const { result } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isOpen).toBe(true)
            })
        })

        it('should not open modal when user has seen it', async () => {
            useLocalStorageSpy.mockReturnValue([true, jest.fn()])

            const { result } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isOpen).toBe(false)
            })
        })

        it('should not open modal when user has primary language or no settings', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])
            server.use(mockGetCurrentUserWithLanguage.handler)

            const { result: withLanguageResult } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(withLanguageResult.current.isOpen).toBe(false)
            })

            queryClient.clear()
            server.use(mockGetCurrentUserNoSettings.handler)

            const { result: noSettingsResult } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(noSettingsResult.current.isOpen).toBe(false)
            })
        })

        it('should not open modal when feature flag is disabled', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])
            useFlagMock.mockReturnValue(false)

            const { result } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(queryClient.isFetching()).toBe(0)
            })

            expect(result.current.isOpen).toBe(false)
        })

        it('should wait for user data to finish fetching before opening', async () => {
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

            const { result } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isOpen).toBe(false)
            })

            act(() => {
                resolveHandler?.()
            })

            await waitFor(() => {
                expect(result.current.isOpen).toBe(true)
            })
        })
    })

    describe('close functionality', () => {
        it('should mark as seen when closing modal', async () => {
            const setHasSeenModal = jest.fn()
            useLocalStorageSpy.mockReturnValue([false, setHasSeenModal])

            const { result } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isOpen).toBe(true)
            })

            act(() => {
                result.current.close()
            })

            expect(setHasSeenModal).toHaveBeenCalledWith(true)
        })

        it('should persist modal seen state and not reopen after closing', async () => {
            let hasSeenModal = false
            useLocalStorageSpy.mockImplementation(() => [
                hasSeenModal,
                (value: boolean) => {
                    hasSeenModal = value
                },
            ])

            const { result, rerender } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isOpen).toBe(true)
            })

            act(() => {
                result.current.close()
            })

            await waitFor(() => {
                expect(result.current.isOpen).toBe(false)
            })

            rerender()

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('local storage integration', () => {
        it('should use correct storage key and persist state', async () => {
            const setHasSeenModal = jest.fn()
            useLocalStorageSpy.mockReturnValue([false, setHasSeenModal])

            const { result } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(useLocalStorageSpy).toHaveBeenCalledWith(
                    'ai-translations-onboarding-modal-shown',
                    false,
                )
            })

            await waitFor(() => {
                expect(result.current.isOpen).toBe(true)
            })

            act(() => {
                result.current.close()
            })

            expect(setHasSeenModal).toHaveBeenCalledWith(true)
        })
    })

    describe('edge cases', () => {
        it('should handle API errors gracefully', async () => {
            useLocalStorageSpy.mockReturnValue([false, jest.fn()])
            const { handler } = mockGetCurrentUserHandler(
                async () => new HttpResponse(null, { status: 500 }),
            )
            server.use(handler)

            const { result } = renderHook(
                () => useTranslationsOnboardingModal(),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.isOpen).toBe(false)
            })
        })
    })
})
