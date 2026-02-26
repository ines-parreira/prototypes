import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'
import { UserSettingType } from '@gorgias/helpdesk-queries'
import type { UserPreferencesSettingData } from '@gorgias/helpdesk-types'
import { Language } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import type { CurrentUser } from '../hooks/useCurrentUserLanguagePreferences'
import { useCurrentUserLanguagePreferences } from '../hooks/useCurrentUserLanguagePreferences'

const server = setupServer()

const mockGetCurrentUser = mockGetCurrentUserHandler()

describe('useCurrentUserLanguagePreferences', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockGetCurrentUser.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        testAppQueryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    it('should return empty values when current user data is not available', async () => {
        const { handler } = mockGetCurrentUserHandler(async () =>
            HttpResponse.json(null),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current.primary).toBeUndefined()
            expect(result.current.proficient).toBeUndefined()
            expect(typeof result.current.shouldShowTranslatedContent).toBe(
                'function',
            )
        })
    })

    it('should return empty values when current user has no settings', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                settings: [],
            } as CurrentUser['data']),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                primary: undefined,
                proficient: undefined,
                shouldShowTranslatedContent: expect.any(Function),
            })
        })
    })

    it('should return empty values when current user has settings but no language preferences', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                settings: [
                    {
                        id: 1,
                        type: UserSettingType.Preferences,
                        data: {
                            theme: 'dark',
                            available: true,
                            show_macros: false,
                        } as unknown as UserPreferencesSettingData,
                    },
                ],
            } as CurrentUser['data']),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                primary: undefined,
                proficient: undefined,
                shouldShowTranslatedContent: expect.any(Function),
            })
        })
    })

    it('should return primary and proficient languages when language preferences exist', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                settings: [
                    {
                        id: 1,
                        type: UserSettingType.LanguagePreferences,
                        data: {
                            primary: Language.Fr,
                            proficient: [Language.En, Language.Es],
                            enabled: true,
                        },
                    },
                ],
            } as CurrentUser['data']),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                primary: Language.Fr,
                proficient: [Language.En, Language.Es],
                shouldShowTranslatedContent: expect.any(Function),
            })
        })
    })

    it('should handle multiple settings and return the correct language preference', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                settings: [
                    {
                        id: 1,
                        type: UserSettingType.Preferences,
                        data: { theme: 'dark' },
                    },
                    {
                        id: 2,
                        type: UserSettingType.LanguagePreferences,
                        data: {
                            primary: Language.Es,
                            proficient: [Language.En],
                            enabled: true,
                        },
                    },
                ],
            } as CurrentUser['data']),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                primary: Language.Es,
                proficient: [Language.En],
                shouldShowTranslatedContent: expect.any(Function),
            })
        })
    })

    it('should handle when settings is undefined', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                // @ts-expect-error - This is a test
                settings: undefined,
            }),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                primary: undefined,
                proficient: undefined,
                shouldShowTranslatedContent: expect.any(Function),
            })
        })
    })

    it('should handle empty proficient array', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                settings: [
                    {
                        id: 1,
                        type: UserSettingType.LanguagePreferences,
                        data: {
                            primary: Language.Fr,
                            proficient: [],
                            enabled: true,
                        },
                    },
                ],
            } as CurrentUser['data']),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                primary: Language.Fr,
                proficient: [],
                shouldShowTranslatedContent: expect.any(Function),
            })
        })
    })

    it('should handle proficient as undefined', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                settings: [
                    {
                        id: 1,
                        type: UserSettingType.LanguagePreferences,
                        data: {
                            primary: Language.De,
                            enabled: true,
                        },
                    },
                ],
            } as CurrentUser['data']),
        )
        server.use(handler)

        const { result } = renderHook(() => useCurrentUserLanguagePreferences())

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                primary: Language.De,
                proficient: undefined,
                shouldShowTranslatedContent: expect.any(Function),
            })
        })
    })

    describe('shouldShowTranslatedContent', () => {
        it('should return false when language is not provided', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.En,
                                proficient: [Language.Fr, Language.Es],
                                enabled: true,
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(() =>
                useCurrentUserLanguagePreferences(),
            )

            await waitFor(() => {
                expect(result.current.shouldShowTranslatedContent(null)).toBe(
                    false,
                )
            })
        })

        it('should return false when language is undefined', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.En,
                                proficient: [Language.Fr, Language.Es],
                                enabled: true,
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(() =>
                useCurrentUserLanguagePreferences(),
            )

            await waitFor(() => {
                expect(
                    result.current.shouldShowTranslatedContent(undefined),
                ).toBe(false)
            })
        })

        it('should return false when language matches primary', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.En,
                                proficient: [Language.Fr, Language.Es],
                                enabled: true,
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(() =>
                useCurrentUserLanguagePreferences(),
            )

            await waitFor(() => {
                expect(
                    result.current.shouldShowTranslatedContent(Language.En),
                ).toBe(false)
            })
        })

        it('should return false when language is in proficient languages', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.En,
                                proficient: [Language.Fr, Language.Es],
                                enabled: true,
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(() =>
                useCurrentUserLanguagePreferences(),
            )

            await waitFor(() => {
                expect(
                    result.current.shouldShowTranslatedContent(Language.Fr),
                ).toBe(false)
            })
        })

        it('should return true when language is not in proficient languages and translations are enabled', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.En,
                                proficient: [Language.Fr, Language.Es],
                                enabled: true,
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(() =>
                useCurrentUserLanguagePreferences(),
            )

            await waitFor(() => {
                expect(
                    result.current.shouldShowTranslatedContent(Language.De),
                ).toBe(true)
            })
        })

        it('should return false when translations are disabled even if language is not in proficient languages', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.En,
                                proficient: [Language.Fr, Language.Es],
                                enabled: false,
                            },
                        },
                    ],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(() =>
                useCurrentUserLanguagePreferences(),
            )

            await waitFor(() => {
                expect(
                    result.current.shouldShowTranslatedContent(Language.De),
                ).toBe(false)
            })
        })

        it('should return false when user has no language preferences and a language is provided', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    settings: [],
                } as CurrentUser['data']),
            )
            server.use(handler)

            const { result } = renderHook(() =>
                useCurrentUserLanguagePreferences(),
            )

            await waitFor(() => {
                expect(
                    result.current.shouldShowTranslatedContent(Language.Es),
                ).toBe(false)
            })
        })
    })
})
