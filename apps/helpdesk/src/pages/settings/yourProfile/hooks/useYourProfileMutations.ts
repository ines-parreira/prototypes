import { useCallback } from 'react'

import _omit from 'lodash/omit'
import _pick from 'lodash/pick'

import type {
    UpdateUserBody,
    UserLanguagePreferencesSetting,
} from '@gorgias/helpdesk-types'
import { UserSettingType } from '@gorgias/helpdesk-types'

import { normalizeUserName } from 'common/utils'

import { useUpdateCurrentUserProfile } from '../hooks/useUpdateCurrentUserProfile'
import {
    useCreateCurrentUserProfileSettings,
    useUpdateCurrentUserProfileSettings,
} from '../hooks/useUpdateCurrentUserProfileSettings'
import type { ApplicationUserPreferencesSettings } from '../types'
import type { useYourProfileForm } from './useYourProfileForm'
import {
    defaultContent,
    validateLanguagePreferences,
} from './useYourProfileForm'

type UseYourProfileMutations = {
    formValues: ReturnType<typeof useYourProfileForm>['formValues']
    defaultFormValues: ReturnType<
        typeof useYourProfileForm
    >['defaultFormValues']
    settingsPreferences?: ApplicationUserPreferencesSettings
    languagePreferences?: UserLanguagePreferencesSetting
    isGorgiasAgent: boolean
}

export function useYourProfileMutations({
    formValues,
    languagePreferences,
    settingsPreferences,
    isGorgiasAgent,
}: UseYourProfileMutations) {
    const { mutateAsync: updateCurrentUser } = useUpdateCurrentUserProfile()

    const { mutateAsync: updateCurrentUserSettings } =
        useUpdateCurrentUserProfileSettings()
    const { mutateAsync: createCurrentUserSettings } =
        useCreateCurrentUserProfileSettings()

    const handleLanguagePreferenceSubmit = useCallback(async () => {
        const hasExistingLanguagePreferences = languagePreferences?.id
        const newLanguagePreferences = {
            primary: formValues.preferences.primary ?? '',
            proficient: formValues.preferences.proficient ?? [],
            enabled: formValues.preferences.enabled ?? false,
        }

        if (!validateLanguagePreferences(newLanguagePreferences)) {
            return
        }

        const languagePreferencesMutation = hasExistingLanguagePreferences
            ? updateCurrentUserSettings({
                  id: languagePreferences.id,
                  data: {
                      type: UserSettingType.LanguagePreferences,
                      data: newLanguagePreferences,
                  },
              })
            : createCurrentUserSettings({
                  data: {
                      type: UserSettingType.LanguagePreferences,
                      data: newLanguagePreferences,
                  },
              })

        await languagePreferencesMutation
    }, [
        languagePreferences,
        updateCurrentUserSettings,
        createCurrentUserSettings,
        formValues,
    ])

    const handleSettingsPreferenceSubmit = useCallback(async () => {
        const hasExistingSettingsPreferences = settingsPreferences?.id

        const newSettingsPreferences = _omit(formValues.preferences, [
            'primary',
            'proficient',
            'enabled',
        ])

        const settingsPreferencesMutation = hasExistingSettingsPreferences
            ? updateCurrentUserSettings({
                  id: settingsPreferences.id,
                  data: {
                      type: UserSettingType.Preferences,
                      data: newSettingsPreferences,
                  },
              })
            : createCurrentUserSettings({
                  data: {
                      type: UserSettingType.Preferences,
                      data: newSettingsPreferences,
                  },
              })

        await settingsPreferencesMutation
    }, [
        settingsPreferences,
        updateCurrentUserSettings,
        createCurrentUserSettings,
        formValues,
    ])

    const handleUserInfoSubmit = useCallback(async () => {
        const includedKeys = Object.keys(
            _omit(defaultContent, [
                'id',
                'preferences',
                'settings',
                'meta',
                'language',
                ...(isGorgiasAgent ? ['bio', 'email', 'name'] : []),
            ]),
        )

        const normalizedValues = _pick(
            formValues,
            includedKeys,
        ) as UpdateUserBody

        if (normalizedValues.name) {
            normalizedValues.name = normalizeUserName(normalizedValues.name)
        }

        await updateCurrentUser(normalizedValues)
    }, [formValues, updateCurrentUser, isGorgiasAgent])

    return {
        handleLanguagePreferenceSubmit,
        handleSettingsPreferenceSubmit,
        handleUserInfoSubmit,
    }
}
