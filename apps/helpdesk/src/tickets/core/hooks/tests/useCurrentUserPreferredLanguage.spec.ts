import { renderHook } from '@testing-library/react'

import { useGetCurrentUser, UserSettingType } from '@gorgias/helpdesk-queries'
import { Language } from '@gorgias/helpdesk-types'

import { useCurrentUserPreferredLanguage } from '../useCurrentUserPreferredLanguage'

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

        expect(result.current).toEqual({
            primary: undefined,
            proficient: undefined,
            languagesNotToTranslateFor: [],
        })
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
            languagesNotToTranslateFor: [],
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
            languagesNotToTranslateFor: [],
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
            languagesNotToTranslateFor: [Language.Fr],
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
            languagesNotToTranslateFor: [Language.Fr, Language.En, Language.Es],
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
            languagesNotToTranslateFor: [Language.En, Language.De],
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
            languagesNotToTranslateFor: [],
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
            languagesNotToTranslateFor: [],
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
            languagesNotToTranslateFor: [Language.Es, Language.En],
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
            languagesNotToTranslateFor: [Language.Ga, Language.It],
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
            languagesNotToTranslateFor: [Language.En],
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
            languagesNotToTranslateFor: [Language.Fr, Language.Es, Language.De],
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
            languagesNotToTranslateFor: [],
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
            languagesNotToTranslateFor: [],
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
            languagesNotToTranslateFor: [Language.It, Language.Pt],
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
            languagesNotToTranslateFor: [Language.Fr],
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
            languagesNotToTranslateFor: [Language.De],
        })
    })
})
