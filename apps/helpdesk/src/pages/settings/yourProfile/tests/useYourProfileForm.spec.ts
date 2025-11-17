import { act, renderHook } from '@testing-library/react'

import type { UserLanguagePreferencesSetting } from '@gorgias/helpdesk-types'

import { DEFAULT_PREFERENCES } from 'config'
import { DateFormatType, TimeFormatType } from 'constants/datetime'

import {
    useYourProfileForm,
    validateLanguagePreferences,
} from '../hooks/useYourProfileForm'
import type { ApplicationUserPreferencesSettings, CurrentUser } from '../types'

describe('useYourProfileForm', () => {
    const mockCurrentUser: Partial<CurrentUser['data']> = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Software Developer',
        timezone: 'UTC',
        language: 'en',
        meta: { profile_picture_url: 'https://example.com/avatar.jpg' },
    }

    const mockSettingsPreferences: ApplicationUserPreferencesSettings = {
        id: 1,
        type: 'preferences',
        data: {
            available: true,
            date_format: DateFormatType.en_GB,
            time_format: TimeFormatType.TwentyFourHour,
            prefill_best_macro: true,
            show_macros: false,
            show_macros_suggestions: true,
            forward_calls: false,
            forwarding_phone_number: '',
            forward_when_offline: false,
        },
    }

    const mockLanguagePreferences: UserLanguagePreferencesSetting = {
        id: 2,
        type: 'language-preferences',
        data: {
            primary: 'en',
            proficient: ['en', 'fr'],
            enabled: true,
        },
    }

    const renderHookWithProps = (props: {
        currentUser: Partial<CurrentUser['data']>
        settingsPreferences?: ApplicationUserPreferencesSettings
        languagePreferences?: UserLanguagePreferencesSetting
    }) => {
        return renderHook(() => useYourProfileForm(props))
    }

    describe('initial state', () => {
        it('should initialize with correct default values when no preferences are provided', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            expect(result.current.defaultFormValues).toEqual({
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                bio: 'Software Developer',
                timezone: 'UTC',
                language: 'en',
                password_confirmation: '',
                meta: { profile_picture_url: 'https://example.com/avatar.jpg' },
                preferences: {
                    ...DEFAULT_PREFERENCES,
                    primary: '',
                    proficient: [],
                    enabled: false,
                },
            })

            expect(result.current.formValues).toEqual(
                result.current.defaultFormValues,
            )
            expect(result.current.isFormDirty).toBe(false)
            expect(result.current.isLoading).toBe(false)
        })

        it('should merge current user data with default preferences when settings are provided', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                settingsPreferences: mockSettingsPreferences,
                languagePreferences: mockLanguagePreferences,
            })

            expect(result.current.defaultFormValues.preferences).toEqual({
                ...DEFAULT_PREFERENCES,
                ...mockSettingsPreferences.data,
                ...mockLanguagePreferences.data,
            })
        })
    })

    describe('handleInputChange', () => {
        it('should update form values and set form as dirty', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            act(() => {
                result.current.handleInputChange('name', 'Jane Doe')
            })

            expect(result.current.formValues.name).toBe('Jane Doe')
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should update multiple fields correctly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            act(() => {
                result.current.handleInputChange('bio', 'New bio')
            })

            expect(result.current.formValues.bio).toBe('New bio')
            expect(result.current.isFormDirty).toBe(true)

            act(() => {
                result.current.handleInputChange('timezone', 'EST')
            })

            expect(result.current.formValues.timezone).toBe('EST')
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should preserve other form values when updating a single field', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            const originalValues = { ...result.current.formValues }

            act(() => {
                result.current.handleInputChange('name', 'Jane Doe')
            })

            expect(result.current.formValues.email).toBe(originalValues.email)
            expect(result.current.formValues.bio).toBe(originalValues.bio)
            expect(result.current.formValues.timezone).toBe(
                originalValues.timezone,
            )
            expect(result.current.formValues.language).toBe(
                originalValues.language,
            )
            expect(result.current.formValues.meta).toEqual(originalValues.meta)
            expect(result.current.formValues.preferences).toEqual(
                originalValues.preferences,
            )
        })
    })

    describe('handlePreferenceChange', () => {
        it('should update boolean preferences correctly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                settingsPreferences: mockSettingsPreferences,
            })

            act(() => {
                result.current.handlePreferenceChange(
                    'prefill_best_macro',
                    false,
                )
            })

            expect(
                result.current.formValues.preferences?.prefill_best_macro,
            ).toBe(false)
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should update string preferences correctly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                settingsPreferences: mockSettingsPreferences,
            })

            act(() => {
                result.current.handlePreferenceChange(
                    'date_format',
                    DateFormatType.en_US,
                )
            })

            expect(result.current.formValues.preferences?.date_format).toBe(
                DateFormatType.en_US,
            )
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should update array preferences correctly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            act(() => {
                result.current.handlePreferenceChange('proficient', [
                    'en',
                    'fr',
                    'es',
                ])
            })

            expect(result.current.formValues.preferences?.proficient).toEqual([
                'en',
                'fr',
                'es',
            ])
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should update record preferences correctly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            act(() => {
                result.current.handlePreferenceChange('hide_tips', true)
            })

            expect(result.current.formValues.preferences?.hide_tips).toBe(true)
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should preserve existing preferences when updating a single preference', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                settingsPreferences: mockSettingsPreferences,
                languagePreferences: mockLanguagePreferences,
            })

            const originalPreferences = {
                ...result.current.formValues.preferences,
            }

            act(() => {
                result.current.handlePreferenceChange(
                    'date_format',
                    DateFormatType.en_US,
                )
            })

            expect(result.current.formValues.preferences?.time_format).toBe(
                originalPreferences.time_format,
            )
            expect(
                result.current.formValues.preferences?.prefill_best_macro,
            ).toBe(originalPreferences.prefill_best_macro)
            expect(result.current.formValues.preferences?.primary).toBe(
                originalPreferences.primary,
            )
            expect(result.current.formValues.preferences?.proficient).toEqual(
                originalPreferences.proficient,
            )
        })

        it('should handle preferences when no preferences exist initially', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            act(() => {
                result.current.handlePreferenceChange('hide_tips', true)
            })

            expect(result.current.formValues.preferences?.hide_tips).toBe(true)
            expect(result.current.isFormDirty).toBe(true)
        })
    })

    describe('handlePrimaryLanguageChange', () => {
        it('should update primary language preference correctly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            const languageOption = { value: 'fr', name: 'French' }

            act(() => {
                result.current.handlePrimaryLanguageChange(languageOption)
            })

            expect(result.current.formValues.preferences?.primary).toBe('fr')
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should handle primary language change when no language preferences exist', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            const languageOption = { value: 'de', name: 'German' }

            act(() => {
                result.current.handlePrimaryLanguageChange(languageOption)
            })

            expect(result.current.formValues.preferences?.primary).toBe('de')
            expect(result.current.isFormDirty).toBe(true)
        })
    })

    describe('handleProficientLanguagesChange', () => {
        it('should update proficient languages correctly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            const newOptions = [
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
            ]

            act(() => {
                result.current.handleProficientLanguagesChange(newOptions)
            })

            expect(result.current.formValues.preferences?.proficient).toEqual([
                'en',
                'fr',
                'de',
            ])
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should handle empty proficient languages array', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            act(() => {
                result.current.handleProficientLanguagesChange([])
            })

            expect(result.current.formValues.preferences?.proficient).toEqual(
                [],
            )
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should handle proficient languages change when no language preferences exist', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            const newOptions = [
                { value: 'es', label: 'Spanish' },
                { value: 'it', label: 'Italian' },
            ]

            act(() => {
                result.current.handleProficientLanguagesChange(newOptions)
            })

            expect(result.current.formValues.preferences?.proficient).toEqual([
                'es',
                'it',
            ])
            expect(result.current.isFormDirty).toBe(true)
        })

        it('should clear proficient languages input after selection', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            act(() => {
                result.current.handleProficientLanguagesInputChange('spa')
            })

            expect(result.current.proficientLanguagesOptions).toContainEqual({
                label: 'Spanish',
                value: 'es',
            })

            const newOptions = [{ value: 'es', label: 'Spanish' }]

            act(() => {
                result.current.handleProficientLanguagesChange(newOptions)
            })

            expect(result.current.proficientLanguagesOptions.length).toBe(181)
        })
    })

    describe('handleProficientLanguagesInputChange', () => {
        it('should update proficient languages search input', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            act(() => {
                result.current.handleProficientLanguagesInputChange('fre')
            })

            expect(result.current.proficientLanguagesOptions).toContainEqual({
                label: 'French',
                value: 'fr',
            })

            expect(
                result.current.proficientLanguagesOptions,
            ).not.toContainEqual({
                label: 'Spanish',
                value: 'es',
            })
        })

        it('should perform case-insensitive filtering', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            act(() => {
                result.current.handleProficientLanguagesInputChange('FRENCH')
            })

            expect(result.current.proficientLanguagesOptions).toContainEqual({
                label: 'French',
                value: 'fr',
            })
        })

        it('should return all options when search input is empty', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            const initialOptionsCount =
                result.current.proficientLanguagesOptions.length

            act(() => {
                result.current.handleProficientLanguagesInputChange('test')
            })

            const filteredOptionsCount =
                result.current.proficientLanguagesOptions.length
            expect(filteredOptionsCount).toBeLessThan(initialOptionsCount)

            act(() => {
                result.current.handleProficientLanguagesInputChange('')
            })

            expect(result.current.proficientLanguagesOptions.length).toBe(
                initialOptionsCount,
            )
        })
    })

    describe('proficientLanguagesOptions', () => {
        it('should provide all language options when no search input is provided', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            expect(result.current.proficientLanguagesOptions.length).toBe(181)

            expect(result.current.proficientLanguagesOptions).toContainEqual({
                label: 'English',
                value: 'en',
            })
            expect(result.current.proficientLanguagesOptions).toContainEqual({
                label: 'French',
                value: 'fr',
            })
            expect(result.current.proficientLanguagesOptions).toContainEqual({
                label: 'Spanish',
                value: 'es',
            })
        })

        it('should filter options based on search input', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            act(() => {
                result.current.handleProficientLanguagesInputChange('ger')
            })

            expect(result.current.proficientLanguagesOptions).toContainEqual({
                label: 'German',
                value: 'de',
            })

            expect(
                result.current.proficientLanguagesOptions,
            ).not.toContainEqual({
                label: 'French',
                value: 'fr',
            })
        })

        it('should return empty array when no languages match the search', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
                languagePreferences: mockLanguagePreferences,
            })

            act(() => {
                result.current.handleProficientLanguagesInputChange('xyzabc123')
            })

            expect(result.current.proficientLanguagesOptions).toEqual([])
        })
    })

    describe('setIsFormDirty', () => {
        it('should allow setting form dirty state', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            expect(result.current.isFormDirty).toBe(false)

            act(() => {
                result.current.setIsFormDirty(true)
            })

            expect(result.current.isFormDirty).toBe(true)

            act(() => {
                result.current.setIsFormDirty(false)
            })

            expect(result.current.isFormDirty).toBe(false)
        })
    })

    describe('setIsLoading', () => {
        it('should allow setting loading state', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            expect(result.current.isLoading).toBe(false)

            act(() => {
                result.current.setIsLoading(true)
            })

            expect(result.current.isLoading).toBe(true)

            act(() => {
                result.current.setIsLoading(false)
            })

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('setFormValues', () => {
        it('should allow setting form values directly', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            const newValues = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                bio: 'New bio',
                timezone: 'EST',
                language: 'fr',
                password_confirmation: '',
                meta: { profile_picture_url: null },
                preferences: {
                    ...DEFAULT_PREFERENCES,
                    date_format: DateFormatType.en_US,
                },
            }

            act(() => {
                result.current.setFormValues(
                    newValues as unknown as typeof result.current.formValues,
                )
            })

            expect(result.current.formValues).toEqual(newValues)
        })

        it('should preserve form dirty state when setting form values', () => {
            const { result } = renderHookWithProps({
                currentUser: mockCurrentUser,
            })

            // First make the form dirty
            act(() => {
                result.current.handleInputChange('name', 'Jane Doe')
            })

            expect(result.current.isFormDirty).toBe(true)

            // Then set new form values
            const newValues = { ...result.current.formValues, bio: 'New bio' }

            act(() => {
                result.current.setFormValues(newValues)
            })

            expect(result.current.formValues).toEqual(newValues)
            expect(result.current.isFormDirty).toBe(true) // Should remain dirty
        })
    })

    describe('memoization', () => {
        it('should memoize defaultFormValues correctly', () => {
            const { result, rerender } = renderHookWithProps({
                currentUser: mockCurrentUser,
                settingsPreferences: mockSettingsPreferences,
                languagePreferences: mockLanguagePreferences,
            })

            const firstRender = result.current.defaultFormValues

            rerender()

            expect(result.current.defaultFormValues).toBe(firstRender)
        })
    })

    describe('validateLanguagePreferences', () => {
        it('should return true if primary language is set', () => {
            const result = validateLanguagePreferences({
                primary: 'en',
                proficient: ['en', 'fr'],
            })
            expect(result).toBe(true)
        })

        it('should return false if primary language is not set', () => {
            const result = validateLanguagePreferences({
                primary: '',
                proficient: ['en', 'fr'],
            })
            expect(result).toBe(false)
        })

        it('should return false if primary language is not set', () => {
            const result = validateLanguagePreferences({
                primary: 'en',
                proficient: [],
            })
            expect(result).toBe(true)
        })
    })
})
