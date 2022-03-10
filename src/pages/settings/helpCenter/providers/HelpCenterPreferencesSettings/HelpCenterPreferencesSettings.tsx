import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import axios from 'axios'
import produce, {Draft} from 'immer'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    HelpCenter,
    HelpCenterTranslationSeoMeta,
    LocaleCode,
} from 'models/helpCenter/types'
import {helpCenterUpdated} from 'state/entities/helpCenter/helpCenters/actions'
import {getViewLanguage} from 'state/ui/helpCenter'
import {changeViewLanguage} from 'state/ui/helpCenter/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {HELP_CENTER_DEFAULT_LOCALE} from 'pages/settings/helpCenter/constants'
import {useHelpCenterActions} from 'pages/settings/helpCenter/hooks/useHelpCenterActions'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {
    getNewHelpCenterTranslation,
    helpCenterSeoMetaFields,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'

export type HelpCenterPreferencesState = {
    name: string
    defaultLanguage: LocaleCode
    availableLanguages: LocaleCode[]
    seoMeta: HelpCenterTranslationSeoMeta
}

type Props = {
    children: React.ReactNode
    helpCenter: HelpCenter
}

type HelpCenterPreferencesContext = {
    preferences: HelpCenterPreferencesState
    updatePreferences: (payload: Partial<HelpCenterPreferencesState>) => void
    savePreferences: () => Promise<void>
    resetPreferences: () => void
    canSavePreferences: boolean
}

const defaultPreferences: HelpCenterPreferencesState = {
    name: '',
    defaultLanguage: HELP_CENTER_DEFAULT_LOCALE,
    availableLanguages: [],
    seoMeta: {
        title: null,
        description: null,
    },
}

const PreferencesContext = createContext<HelpCenterPreferencesContext>({
    preferences: defaultPreferences,
    updatePreferences: () => null,
    savePreferences: () => Promise.resolve(),
    resetPreferences: () => null,
    canSavePreferences: false,
})

// This provider holds all the preferences
// settings that are found in Help Center > Preferences tab
export const HelpCenterPreferencesSettings = ({
    children,
    helpCenter,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const {fetchHelpCenterTranslations} = useHelpCenterActions()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [preferences, updatePreferences] =
        useState<HelpCenterPreferencesState>(defaultPreferences)

    const nameChanged = useMemo(
        () => helpCenter.name !== preferences.name,
        [helpCenter, preferences]
    )

    const defaultLanguageChanged = useMemo(
        () => helpCenter.default_locale !== preferences.defaultLanguage,
        [helpCenter, preferences]
    )

    const supportedLanguagesChanged = useMemo(() => {
        if (preferences.availableLanguages.length === 0) {
            return false
        }

        if (
            helpCenter.supported_locales.length !==
            preferences.availableLanguages.length
        ) {
            return true
        }

        return [...preferences.availableLanguages]
            .sort()
            .some(
                (locale, index) =>
                    locale !== [...helpCenter.supported_locales].sort()[index]
            )
    }, [helpCenter, preferences])

    const seoChanged = useMemo(() => {
        const translation = helpCenter.translations?.find(
            (t) => t.locale === viewLanguage
        )

        if (!translation) return false

        return helpCenterSeoMetaFields.some(
            (key) => translation.seo_meta[key] !== preferences.seoMeta[key]
        )
    }, [helpCenter.translations, preferences, viewLanguage])

    const areChangesValid = useMemo(() => !!preferences.name, [preferences])

    const canSavePreferences = useMemo(
        () =>
            (nameChanged || defaultLanguageChanged || seoChanged) &&
            areChangesValid,
        [nameChanged, defaultLanguageChanged, seoChanged, areChangesValid]
    )

    const savePreferences = async () => {
        if (!client) return

        try {
            if (seoChanged) {
                const {seoMeta} = preferences

                await client.updateHelpCenterTranslation(
                    {
                        help_center_id: helpCenter.id,
                        locale: viewLanguage,
                    },
                    {
                        seo_meta: {
                            title: seoMeta.title || null,
                            description: seoMeta.description || null,
                        },
                    }
                )

                await fetchHelpCenterTranslations()
            }

            if (nameChanged || defaultLanguageChanged) {
                const {data: updatedHelpCenter} = await client.updateHelpCenter(
                    {help_center_id: helpCenter.id},
                    {
                        name: preferences.name,
                        default_locale: preferences.defaultLanguage,
                    }
                )

                dispatch(helpCenterUpdated(updatedHelpCenter))

                if (defaultLanguageChanged) {
                    dispatch(
                        changeViewLanguage(updatedHelpCenter.default_locale)
                    )
                }
            }

            void dispatch(
                notify({
                    message: 'Help Center updated with success',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            const errorMessage =
                axios.isAxiosError(err) && err.response?.status === 400
                    ? ': some fields are empty or invalid.'
                    : ', please try again later.'

            void dispatch(
                notify({
                    message: `Could not update the Help Center: ${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

    const handleSupportedLocalesChange = useCallback(async () => {
        if (!client) return

        // Remove unsupported locales
        await Promise.all(
            helpCenter.supported_locales.map((locale) => {
                if (!preferences.availableLanguages.includes(locale)) {
                    return client.deleteHelpCenterTranslation({
                        help_center_id: helpCenter.id,
                        locale: locale,
                    })
                }
            })
        )

        // Add new supported locales
        await Promise.all(
            preferences.availableLanguages.map(async (locale) => {
                if (!helpCenter.supported_locales.includes(locale)) {
                    return client.createHelpCenterTranslation(
                        {
                            help_center_id: helpCenter.id,
                        },
                        getNewHelpCenterTranslation(locale)
                    )
                }
            })
        )

        dispatch(
            helpCenterUpdated({
                ...helpCenter,
                supported_locales: preferences.availableLanguages,
            })
        )

        if (!preferences.availableLanguages.includes(viewLanguage)) {
            dispatch(changeViewLanguage(helpCenter.default_locale))
        }
    }, [client, helpCenter, preferences, viewLanguage])

    const handleOnUpdate = useCallback(
        (payload: Partial<HelpCenterPreferencesState>) => {
            updatePreferences({
                ...preferences,
                ...payload,
            })
        },
        [updatePreferences, preferences]
    )

    const updatePreferencesFromData = useCallback(() => {
        const updateFn = (draftSettings: Draft<HelpCenterPreferencesState>) => {
            draftSettings.name = helpCenter.name
            draftSettings.defaultLanguage = helpCenter.default_locale
            draftSettings.availableLanguages = helpCenter.supported_locales

            const translation = helpCenter.translations?.find(
                (t) => t.locale === viewLanguage
            )

            if (translation) {
                draftSettings.seoMeta = translation.seo_meta
            }
        }

        updatePreferences(produce(preferences, updateFn))
    }, [helpCenter, preferences, viewLanguage])

    useEffect(() => {
        updatePreferencesFromData()
    }, [helpCenter, viewLanguage])

    useEffect(() => {
        if (!helpCenter.translations) {
            void fetchHelpCenterTranslations()
        }
    }, [])

    useEffect(() => {
        if (supportedLanguagesChanged) {
            void handleSupportedLocalesChange()
        }
    }, [supportedLanguagesChanged])

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                updatePreferences: handleOnUpdate,
                savePreferences,
                resetPreferences: updatePreferencesFromData,
                canSavePreferences,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    )
}

export const useHelpCenterPreferencesSettings =
    (): HelpCenterPreferencesContext => {
        return useContext(PreferencesContext)
    }
