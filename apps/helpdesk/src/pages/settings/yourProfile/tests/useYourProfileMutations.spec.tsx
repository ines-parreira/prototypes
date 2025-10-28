import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { UserSettingType } from '@gorgias/helpdesk-types'

import { DateFormatType, TimeFormatType } from 'constants/datetime'
import { Language } from 'constants/languages'

import { useYourProfileMutations } from '../hooks/useYourProfileMutations'

// Mock the hooks
jest.mock('../hooks/useUpdateCurrentUserProfile')
jest.mock('../hooks/useUpdateCurrentUserProfileSettings')

const mockUpdateCurrentUser = jest.fn()
const mockUpdateCurrentUserSettings = jest.fn()
const mockCreateCurrentUserSettings = jest.fn()

const mockUseUpdateCurrentUserProfile = {
    mutateAsync: mockUpdateCurrentUser,
}

const mockUseUpdateCurrentUserProfileSettings = {
    mutateAsync: mockUpdateCurrentUserSettings,
}

const mockUseCreateCurrentUserProfileSettings = {
    mutateAsync: mockCreateCurrentUserSettings,
}

jest.mocked(
    require('../hooks/useUpdateCurrentUserProfile').useUpdateCurrentUserProfile,
).mockReturnValue(mockUseUpdateCurrentUserProfile)
jest.mocked(
    require('../hooks/useUpdateCurrentUserProfileSettings')
        .useUpdateCurrentUserProfileSettings,
).mockReturnValue(mockUseUpdateCurrentUserProfileSettings)
jest.mocked(
    require('../hooks/useUpdateCurrentUserProfileSettings')
        .useCreateCurrentUserProfileSettings,
).mockReturnValue(mockUseCreateCurrentUserProfileSettings)

const mockFormValues = {
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software Engineer',
    timezone: 'UTC',
    language: Language.EnglishUs,
    password_confirmation: '',
    meta: { profile_picture_url: null },
    preferences: {
        primary: 'en',
        proficient: ['fr', 'es'],
        enabled: false,
        time_format: TimeFormatType.AmPm,
        date_format: DateFormatType.en_US,
        forward_when_offline: true,
        show_macros_suggestions: false,
        available: true,
        show_macros: false,
        prefill_best_macro: true,
        hide_tips: false,
        forward_calls: false,
        forwarding_phone_number: '',
        macros_default_to_search_popover: false,
    },
} as any

const mockDefaultFormValues = {
    ...mockFormValues,
    id: 1,
}

const mockLanguagePreferences = {
    id: 123,
    type: UserSettingType.LanguagePreferences,
    data: {
        primary: 'en',
        proficient: ['fr'],
        enabled: true,
    },
}

const mockSettingsPreferences = {
    id: 456,
    type: UserSettingType.Preferences,
    data: {
        time_format: TimeFormatType.TwentyFourHour,
        date_format: DateFormatType.en_GB,
        forward_when_offline: false,
        show_macros_suggestions: true,
        available: false,
        show_macros: true,
        prefill_best_macro: false,
        hide_tips: true,
        forward_calls: false,
        forwarding_phone_number: '',
        macros_default_to_search_popover: true,
    },
}

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useYourProfileMutations', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUpdateCurrentUser.mockResolvedValue({ data: { id: 1 } })
        mockUpdateCurrentUserSettings.mockResolvedValue({ data: { id: 123 } })
        mockCreateCurrentUserSettings.mockResolvedValue({ data: { id: 789 } })
    })

    describe('handleLanguagePreferenceSubmit', () => {
        it('should update existing language preferences when languagePreferences has an id', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleLanguagePreferenceSubmit()
            })

            expect(mockUpdateCurrentUserSettings).toHaveBeenCalledWith({
                id: 123,
                data: {
                    type: UserSettingType.LanguagePreferences,
                    data: {
                        primary: 'en',
                        proficient: ['fr', 'es'],
                        enabled: false,
                    },
                },
            })
            expect(mockCreateCurrentUserSettings).not.toHaveBeenCalled()
        })

        it('should create new language preferences when languagePreferences has no id', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: undefined,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleLanguagePreferenceSubmit()
            })

            expect(mockCreateCurrentUserSettings).toHaveBeenCalledWith({
                data: {
                    type: UserSettingType.LanguagePreferences,
                    data: {
                        primary: 'en',
                        proficient: ['fr', 'es'],
                        enabled: false,
                    },
                },
            })
            expect(mockUpdateCurrentUserSettings).not.toHaveBeenCalled()
        })

        it('should handle empty primary language by returning early', async () => {
            const formValuesWithEmptyPrimary = {
                ...mockFormValues,
                preferences: {
                    ...mockFormValues.preferences,
                    primary: '',
                },
            }

            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: formValuesWithEmptyPrimary,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleLanguagePreferenceSubmit()
            })

            expect(mockUpdateCurrentUserSettings).not.toHaveBeenCalled()
            expect(mockCreateCurrentUserSettings).not.toHaveBeenCalled()
        })

        it('should handle undefined primary language by returning early due to validation', async () => {
            const formValuesWithUndefinedPrimary = {
                ...mockFormValues,
                preferences: {
                    ...mockFormValues.preferences,
                    primary: undefined,
                },
            }

            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: formValuesWithUndefinedPrimary,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleLanguagePreferenceSubmit()
            })

            // Should return early due to validation failure, so no mutation should be called
            expect(mockUpdateCurrentUserSettings).not.toHaveBeenCalled()
            expect(mockCreateCurrentUserSettings).not.toHaveBeenCalled()
        })

        it('should handle undefined proficient languages by defaulting to empty array', async () => {
            const formValuesWithUndefinedProficient = {
                ...mockFormValues,
                preferences: {
                    ...mockFormValues.preferences,
                    proficient: undefined,
                },
            }

            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: formValuesWithUndefinedProficient,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleLanguagePreferenceSubmit()
            })

            expect(mockUpdateCurrentUserSettings).toHaveBeenCalledWith({
                id: 123,
                data: {
                    type: UserSettingType.LanguagePreferences,
                    data: {
                        primary: 'en',
                        proficient: [],
                        enabled: false,
                    },
                },
            })
        })
    })

    describe('handleSettingsPreferenceSubmit', () => {
        it('should update existing settings preferences when settingsPreferences has an id', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleSettingsPreferenceSubmit()
            })

            expect(mockUpdateCurrentUserSettings).toHaveBeenCalledWith({
                id: 456,
                data: {
                    type: UserSettingType.Preferences,
                    data: {
                        time_format: TimeFormatType.AmPm,
                        date_format: DateFormatType.en_US,
                        forward_when_offline: true,
                        show_macros_suggestions: false,
                        available: true,
                        show_macros: false,
                        prefill_best_macro: true,
                        hide_tips: false,
                        forward_calls: false,
                        forwarding_phone_number: '',
                        macros_default_to_search_popover: false,
                    },
                },
            })
            expect(mockCreateCurrentUserSettings).not.toHaveBeenCalled()
        })

        it('should create new settings preferences when settingsPreferences has no id', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: undefined,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleSettingsPreferenceSubmit()
            })

            expect(mockCreateCurrentUserSettings).toHaveBeenCalledWith({
                data: {
                    type: UserSettingType.Preferences,
                    data: {
                        time_format: TimeFormatType.AmPm,
                        date_format: DateFormatType.en_US,
                        forward_when_offline: true,
                        show_macros_suggestions: false,
                        available: true,
                        show_macros: false,
                        prefill_best_macro: true,
                        hide_tips: false,
                        forward_calls: false,
                        forwarding_phone_number: '',
                        macros_default_to_search_popover: false,
                    },
                },
            })
            expect(mockUpdateCurrentUserSettings).not.toHaveBeenCalled()
        })

        it('should exclude primary, proficient, and enabled from settings preferences', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleSettingsPreferenceSubmit()
            })

            const callData =
                mockUpdateCurrentUserSettings.mock.calls[0][0].data.data
            expect(callData).not.toHaveProperty('primary')
            expect(callData).not.toHaveProperty('proficient')
            expect(callData).not.toHaveProperty('enabled')
            expect(callData).toHaveProperty('time_format')
            expect(callData).toHaveProperty('date_format')
        })
    })

    describe('handleUserInfoSubmit', () => {
        it('should update user info with correct fields for regular users', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleUserInfoSubmit()
            })

            expect(mockUpdateCurrentUser).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                bio: 'Software Engineer',
                timezone: 'UTC',
                password_confirmation: '',
            })
        })

        it('should exclude bio, email, and name for Gorgias agents', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: true,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleUserInfoSubmit()
            })

            const callData = mockUpdateCurrentUser.mock.calls[0][0]
            expect(callData).not.toHaveProperty('bio')
            expect(callData).not.toHaveProperty('email')
            expect(callData).not.toHaveProperty('name')
            expect(callData).toHaveProperty('timezone')
            expect(callData).toHaveProperty('password_confirmation')
        })

        it('should always exclude id, preferences, settings, meta, and language from user info', async () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleUserInfoSubmit()
            })

            const callData = mockUpdateCurrentUser.mock.calls[0][0]
            expect(callData).not.toHaveProperty('id')
            expect(callData).not.toHaveProperty('preferences')
            expect(callData).not.toHaveProperty('settings')
            expect(callData).not.toHaveProperty('meta')
        })

        it('should handle form values with missing optional fields', async () => {
            const minimalFormValues = {
                name: 'John Doe',
                email: 'john@example.com',
                bio: '',
                timezone: '',
                language: Language.EnglishUs,
                password_confirmation: '',
                meta: { profile_picture_url: null },
                preferences: {
                    primary: 'en',
                    proficient: ['fr'],
                    enabled: false,
                    time_format: TimeFormatType.AmPm,
                    date_format: DateFormatType.en_US,
                    forward_when_offline: false,
                    show_macros_suggestions: false,
                    available: true,
                    show_macros: false,
                    prefill_best_macro: true,
                    hide_tips: false,
                    forward_calls: false,
                    forwarding_phone_number: '',
                    macros_default_to_search_popover: false,
                },
            } as any

            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: minimalFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.handleUserInfoSubmit()
            })

            expect(mockUpdateCurrentUser).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                bio: '',
                timezone: '',
                password_confirmation: '',
            })
        })
    })

    describe('error handling', () => {
        it('should propagate errors from language preferences mutation', async () => {
            const error = new Error('Language preferences update failed')
            mockUpdateCurrentUserSettings.mockRejectedValue(error)

            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await expect(
                act(async () => {
                    await result.current.handleLanguagePreferenceSubmit()
                }),
            ).rejects.toThrow('Language preferences update failed')
        })

        it('should propagate errors from settings preferences mutation', async () => {
            const error = new Error('Settings preferences update failed')
            mockUpdateCurrentUserSettings.mockRejectedValue(error)

            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await expect(
                act(async () => {
                    await result.current.handleSettingsPreferenceSubmit()
                }),
            ).rejects.toThrow('Settings preferences update failed')
        })

        it('should propagate errors from user info mutation', async () => {
            const error = new Error('User info update failed')
            mockUpdateCurrentUser.mockRejectedValue(error)

            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            await expect(
                act(async () => {
                    await result.current.handleUserInfoSubmit()
                }),
            ).rejects.toThrow('User info update failed')
        })
    })

    describe('hook return values', () => {
        it('should return all three mutation handlers', () => {
            const { result } = renderHook(
                () =>
                    useYourProfileMutations({
                        formValues: mockFormValues,
                        defaultFormValues: mockDefaultFormValues,
                        languagePreferences: mockLanguagePreferences,
                        settingsPreferences: mockSettingsPreferences,
                        isGorgiasAgent: false,
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current).toHaveProperty(
                'handleLanguagePreferenceSubmit',
            )
            expect(result.current).toHaveProperty(
                'handleSettingsPreferenceSubmit',
            )
            expect(result.current).toHaveProperty('handleUserInfoSubmit')
            expect(typeof result.current.handleLanguagePreferenceSubmit).toBe(
                'function',
            )
            expect(typeof result.current.handleSettingsPreferenceSubmit).toBe(
                'function',
            )
            expect(typeof result.current.handleUserInfoSubmit).toBe('function')
        })
    })
})
