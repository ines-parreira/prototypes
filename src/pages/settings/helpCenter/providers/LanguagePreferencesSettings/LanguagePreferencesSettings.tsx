import React from 'react'
import produce, {Draft} from 'immer'

import {useAsyncFn} from 'react-use'

import {LocaleCode} from '../../../../../models/helpCenter/types'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {helpCenterUpdated} from '../../../../../state/entities/helpCenters/actions'
import {notify} from '../../../../../state/notifications/actions'
import {changeViewLanguage} from '../../../../../state/helpCenter/ui/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'

import {HELP_CENTER_LANGUAGE_DEFAULT} from '../../constants'

import {useHelpcenterApi} from '../../hooks/useHelpcenterApi'
import {useCurrentHelpCenter} from '../../hooks/useCurrentHelpCenter'

export type PreferencesState = {
    defaultLanguage: LocaleCode
    availableLanguages: LocaleCode[]
}

type Props = {
    children: React.ReactNode
    helpcenterId: number
    defaultLocale: LocaleCode
    availableLocales: LocaleCode[]
}

type PreferencesContextApi = {
    preferences: PreferencesState
    updatePreference: (payload: Partial<PreferencesState>) => void
    savePreferences: () => Promise<unknown>
    resetPreferences: () => void
    arePreferencesChanged: () => boolean
}

const defaultPreferences = {
    defaultLanguage: HELP_CENTER_LANGUAGE_DEFAULT,
    availableLanguages: [],
}

const PreferencesContext = React.createContext<PreferencesContextApi>({
    preferences: defaultPreferences,
    updatePreference: () => null,
    savePreferences: () => Promise.resolve(),
    resetPreferences: () => null,
    arePreferencesChanged: () => false,
})

//   This provider holds all the preference
// settings that are found in the Help Center / Preferences
export const LanguagePreferencesSettings = ({
    children,
    helpcenterId,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const [preferences, updatePreference] = React.useState<PreferencesState>(
        defaultPreferences
    )
    const {data} = useCurrentHelpCenter()

    const {client} = useHelpcenterApi()
    const [, savePreferences] = useAsyncFn(() => {
        if (!client) {
            throw new Error('Missing http client')
        }
        return client
            .updateHelpCenter(
                {help_center_id: helpcenterId},
                {
                    default_locale: preferences.defaultLanguage,
                    supported_locales: preferences.availableLanguages,
                }
            )
            .then((response) => {
                dispatch(helpCenterUpdated(response.data))
                dispatch(changeViewLanguage(response.data.default_locale))
                void dispatch(
                    notify({
                        message: 'Successfully saved the preferences',
                        status: NotificationStatus.Success,
                    })
                )
                return response.data
            })
            .catch((err) => {
                void dispatch(
                    notify({
                        message: 'Something went wrong saving the preferences',
                        status: NotificationStatus.Error,
                    })
                )
                throw err
            })
    }, [client, preferences])

    const handleOnUpdate = React.useCallback(
        (payload: Partial<PreferencesState>) => {
            updatePreference({
                ...preferences,
                ...payload,
            })
        },
        [updatePreference, preferences]
    )

    const updatePreferencesFromData = React.useCallback(() => {
        const updateFn = (draftSettings: Draft<PreferencesState>) => {
            if (data) {
                if (data.default_locale) {
                    draftSettings.defaultLanguage = data.default_locale
                }
                if (data.supported_locales) {
                    draftSettings.availableLanguages = data.supported_locales
                }
            }
        }

        updatePreference(produce(preferences, updateFn))
    }, [data, preferences])

    const arePreferencesChanged = React.useCallback(() => {
        if (data?.default_locale !== preferences.defaultLanguage) {
            return true
        }

        const areAvailableLanguagesChanged = preferences.availableLanguages.some(
            (locale, index) => {
                if (data.supported_locales[index]) {
                    return data.supported_locales[index] !== locale
                }
                return true
            }
        )
        if (
            preferences.availableLanguages.length !==
                data.supported_locales.length ||
            areAvailableLanguagesChanged
        ) {
            return true
        }

        return false
    }, [data, preferences])

    React.useEffect(() => {
        updatePreferencesFromData()
    }, [data])

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                updatePreference: handleOnUpdate,
                savePreferences,
                resetPreferences: updatePreferencesFromData,
                arePreferencesChanged,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    )
}

export const useLanguagePreferencesSettings = (): PreferencesContextApi => {
    return React.useContext(PreferencesContext)
}
