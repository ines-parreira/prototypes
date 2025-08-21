import { useCallback, useMemo, useState } from 'react'

import _merge from 'lodash/merge'

import type { SelectFieldOption } from '@gorgias/axiom'
import { UserLanguagePreferencesSetting } from '@gorgias/helpdesk-types'

import { DEFAULT_PREFERENCES } from 'config'
import { ISO639English } from 'constants/languages'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'

import { ApplicationUserPreferencesSettings, CurrentUser } from '../types'

type DefaultFormValues = {
    name: string
    email: string
    bio: string
    timezone: string
    language: string
    password_confirmation: string
    meta: { profile_picture_url: string | null }
}

export const defaultContent: DefaultFormValues = {
    name: '',
    email: '',
    password_confirmation: '',
    bio: '',
    timezone: '',
    language: '',
    meta: { profile_picture_url: null },
}

type UseYourProfileFormProps = {
    currentUser: Partial<CurrentUser['data']>
    settingsPreferences?: ApplicationUserPreferencesSettings
    languagePreferences?: UserLanguagePreferencesSetting
}

export function validateLanguagePreferences(languagePreferences: {
    primary: string
    proficient: string[]
}) {
    return languagePreferences.primary.length > 0
}

export function useYourProfileForm({
    currentUser,
    settingsPreferences,
    languagePreferences,
}: UseYourProfileFormProps) {
    const [proficientLanguagesInput, setProficientLanguagesInput] = useState('')
    const [isFormDirty, setIsFormDirty] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const defaultFormValues = useMemo(() => {
        return _merge(defaultContent, {
            ...currentUser,
            preferences: {
                ...DEFAULT_PREFERENCES,
                primary: 'en',
                proficient: [],
                ...settingsPreferences?.data,
                ...languagePreferences?.data,
            },
        })
    }, [currentUser, settingsPreferences, languagePreferences])

    const [formValues, setFormValues] = useState(() => defaultFormValues)

    const handleInputChange = useCallback(
        (name: string, value: string) => {
            setFormValues({ ...formValues, [name]: value })
            setIsFormDirty(true)
        },
        [formValues],
    )

    const handlePreferenceChange = useCallback(
        (
            preferenceKey: string,
            value:
                | boolean
                | string
                | string[]
                | Record<string, string | string[] | undefined>,
        ) => {
            setFormValues({
                ...formValues,
                preferences: {
                    ...formValues.preferences,
                    [preferenceKey]: value,
                },
            })
            setIsFormDirty(true)
        },
        [formValues],
    )

    const handlePrimaryLanguageChange = useCallback(
        (language: SelectFieldOption) => {
            handlePreferenceChange('primary', language.value)
        },
        [handlePreferenceChange],
    )

    const handleProficientLanguagesChange = useCallback(
        (options: Option[]) => {
            handlePreferenceChange(
                'proficient',
                options.map((option) => option.value as string),
            )
            setProficientLanguagesInput('')
        },
        [handlePreferenceChange],
    )

    const handleProficientLanguagesInputChange = useCallback(
        (value: string) => {
            setProficientLanguagesInput(value)
        },
        [],
    )

    const proficientLanguagesOptions = useMemo(() => {
        const allOptions = Object.entries(ISO639English).map(
            ([code, name]) => ({
                label: name,
                value: code,
            }),
        )

        if (proficientLanguagesInput.length === 0) {
            return allOptions
        }

        return allOptions.filter(({ label }) =>
            label
                .toLowerCase()
                .includes(proficientLanguagesInput.toLowerCase()),
        )
    }, [proficientLanguagesInput])

    return {
        isFormDirty,
        setIsFormDirty,
        isLoading,
        setIsLoading,
        formValues,
        setFormValues,
        defaultFormValues,
        handleInputChange,
        handlePreferenceChange,
        handlePrimaryLanguageChange,
        handleProficientLanguagesChange,
        handleProficientLanguagesInputChange,
        proficientLanguagesOptions,
    }
}
