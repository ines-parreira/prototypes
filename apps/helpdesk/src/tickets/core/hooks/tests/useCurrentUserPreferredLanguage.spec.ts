import { renderHook } from '@testing-library/react'

import { useGetCurrentUser, UserSettingType } from '@gorgias/helpdesk-queries'
import { Language } from '@gorgias/helpdesk-types'

import { useCurrentUserPreferredLanguage } from '../translations/useCurrentUserPreferredLanguage'

jest.mock('@gorgias/helpdesk-queries')

const mockUseGetCurrentUser = useGetCurrentUser as jest.MockedFunction<
    typeof useGetCurrentUser
>

describe('useCurrentUserPreferredLanguage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return empty values when current user data is not available', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current.primary).toBeUndefined()
        expect(result.current.proficient).toBeUndefined()
        expect(typeof result.current.shouldShowTranslatedContent).toBe(
            'function',
        )
    })

    it('should return empty values when current user has no settings', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: undefined,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should return empty values when current user has settings but no language preferences', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.Preferences,
                            data: { theme: 'dark' },
                        },
                        {
                            id: 2,
                            type: UserSettingType.ViewsOrdering,
                            data: { order: ['view1', 'view2'] },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: undefined,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should return the primary language when language preferences exist', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.Fr,
                                secondary: Language.En,
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: Language.Fr,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should return proficient languages when they exist', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.Fr,
                                proficient: [Language.En, Language.Es],
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: Language.Fr,
            proficient: [Language.En, Language.Es],
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should handle only proficient languages without primary', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: undefined,
                                proficient: [Language.En, Language.De],
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: undefined,
            proficient: [Language.En, Language.De],
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should return empty values when language preferences exist but primary is not set', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: undefined,
                                secondary: Language.En,
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: undefined,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should return empty values when language preferences data is null', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: null,
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: undefined,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should handle multiple settings and return the correct language preference', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
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
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: Language.Es,
            proficient: [Language.En],
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should memoize the result based on current user data', () => {
        const userData = {
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.Ga,
                                proficient: [Language.It],
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        }

        mockUseGetCurrentUser.mockReturnValue(userData as any)

        const { result, rerender } = renderHook(() =>
            useCurrentUserPreferredLanguage(),
        )

        // Rerender with same data
        rerender()

        expect(result.current).toEqual({
            primary: Language.Ga,
            proficient: [Language.It],
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should update result when user data changes', () => {
        const initialUserData = {
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.En,
                                proficient: [],
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        }

        mockUseGetCurrentUser.mockReturnValue(initialUserData as any)

        const { result, rerender } = renderHook(() =>
            useCurrentUserPreferredLanguage(),
        )

        expect(result.current).toEqual({
            primary: Language.En,
            proficient: [],
            shouldShowTranslatedContent: expect.any(Function),
        })

        // Update user data with different language
        const updatedUserData = {
            ...initialUserData,
            data: {
                data: {
                    ...initialUserData.data.data,
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.Fr,
                                proficient: [Language.Es, Language.De],
                            },
                        },
                    ],
                },
            },
        }

        mockUseGetCurrentUser.mockReturnValue(updatedUserData as any)

        rerender()

        expect(result.current).toEqual({
            primary: Language.Fr,
            proficient: [Language.Es, Language.De],
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should handle when settings is undefined', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: undefined,
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: undefined,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should handle when data.data is null', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: null,
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: undefined,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should return the first language preference when multiple exist', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.It,
                                proficient: [Language.Pt],
                            },
                        },
                        {
                            id: 2,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.Es,
                                proficient: [Language.Fr],
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: Language.It,
            proficient: [Language.Pt],
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should handle empty proficient array', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.Fr,
                                proficient: [],
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: Language.Fr,
            proficient: [],
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    it('should handle proficient as undefined', () => {
        mockUseGetCurrentUser.mockReturnValue({
            data: {
                data: {
                    id: 1,
                    email: 'user@example.com',
                    settings: [
                        {
                            id: 1,
                            type: UserSettingType.LanguagePreferences,
                            data: {
                                primary: Language.De,
                            },
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useCurrentUserPreferredLanguage())

        expect(result.current).toEqual({
            primary: Language.De,
            proficient: undefined,
            shouldShowTranslatedContent: expect.any(Function),
        })
    })

    describe('shouldShowTranslatedContent', () => {
        it('should return false when language is not provided', () => {
            mockUseGetCurrentUser.mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        settings: [
                            {
                                id: 1,
                                type: UserSettingType.LanguagePreferences,
                                data: {
                                    primary: Language.En,
                                    proficient: [Language.Fr, Language.Es],
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const { result } = renderHook(() =>
                useCurrentUserPreferredLanguage(),
            )

            expect(result.current.shouldShowTranslatedContent(null)).toBe(false)
        })

        it('should return false when language is undefined', () => {
            mockUseGetCurrentUser.mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        settings: [
                            {
                                id: 1,
                                type: UserSettingType.LanguagePreferences,
                                data: {
                                    primary: Language.En,
                                    proficient: [Language.Fr, Language.Es],
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const { result } = renderHook(() =>
                useCurrentUserPreferredLanguage(),
            )

            expect(result.current.shouldShowTranslatedContent(undefined)).toBe(
                false,
            )
        })

        it('should return false when language matches primary', () => {
            mockUseGetCurrentUser.mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        settings: [
                            {
                                id: 1,
                                type: UserSettingType.LanguagePreferences,
                                data: {
                                    primary: Language.En,
                                    proficient: [Language.Fr, Language.Es],
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const { result } = renderHook(() =>
                useCurrentUserPreferredLanguage(),
            )

            expect(
                result.current.shouldShowTranslatedContent(Language.En),
            ).toBe(false)
        })

        it('should return false when language is in proficient languages', () => {
            mockUseGetCurrentUser.mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        settings: [
                            {
                                id: 1,
                                type: UserSettingType.LanguagePreferences,
                                data: {
                                    primary: Language.En,
                                    proficient: [Language.Fr, Language.Es],
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const { result } = renderHook(() =>
                useCurrentUserPreferredLanguage(),
            )

            expect(
                result.current.shouldShowTranslatedContent(Language.Fr),
            ).toBe(false)
        })

        it('should return true when language is not in proficient languages', () => {
            mockUseGetCurrentUser.mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        settings: [
                            {
                                id: 1,
                                type: UserSettingType.LanguagePreferences,
                                data: {
                                    primary: Language.En,
                                    proficient: [Language.Fr, Language.Es],
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const { result } = renderHook(() =>
                useCurrentUserPreferredLanguage(),
            )

            expect(
                result.current.shouldShowTranslatedContent(Language.De),
            ).toBe(true)
        })

        it('should return false when user has no language preferences and a language is provided', () => {
            mockUseGetCurrentUser.mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        settings: [],
                    },
                },
                isLoading: false,
                isError: false,
                error: null,
            } as any)

            const { result } = renderHook(() =>
                useCurrentUserPreferredLanguage(),
            )

            expect(
                result.current.shouldShowTranslatedContent(Language.Es),
            ).toBe(false)
        })
    })
})
