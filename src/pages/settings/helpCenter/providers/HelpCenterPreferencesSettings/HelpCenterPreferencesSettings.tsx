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
import {useSelector} from 'react-redux'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {
    CreateHelpCenterTranslationDto,
    HelpCenterTranslation,
    LocaleCode,
} from '../../../../../models/helpCenter/types'
import {helpCenterUpdated} from '../../../../../state/entities/helpCenters/actions'
import {getViewLanguage} from '../../../../../state/helpCenter/ui'
import {changeViewLanguage} from '../../../../../state/helpCenter/ui/actions'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {useCurrentHelpCenter} from '../../hooks/useCurrentHelpCenter'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'
import {
    getNewHelpCenterTranslation,
    helpCenterSeoMetaFields,
} from '../../utils/helpCenter.utils'

export type HelpCenterPreferencesState = {
    name: string
    defaultLanguage: LocaleCode
    availableLanguages: LocaleCode[]
    translation: CreateHelpCenterTranslationDto | HelpCenterTranslation
}

type Props = {
    children: React.ReactNode
    helpCenterId: number
}

type HelpCenterPreferencesContext = {
    preferences: HelpCenterPreferencesState
    updatePreferences: (payload: Partial<HelpCenterPreferencesState>) => void
    savePreferences: () => Promise<void>
    resetPreferences: () => void
    havePreferencesChanged: boolean
    areChangesValid: boolean
}

const defaultPreferences: HelpCenterPreferencesState = {
    name: '',
    defaultLanguage: HELP_CENTER_DEFAULT_LOCALE,
    availableLanguages: [],
    translation: getNewHelpCenterTranslation(HELP_CENTER_DEFAULT_LOCALE),
}

const PreferencesContext = createContext<HelpCenterPreferencesContext>({
    preferences: defaultPreferences,
    updatePreferences: () => null,
    savePreferences: () => Promise.resolve(),
    resetPreferences: () => null,
    havePreferencesChanged: false,
    areChangesValid: false,
})

// This provider holds all the preference
// settings that are found in the Help Center / Preferences
export const HelpCenterPreferencesSettings = ({
    children,
    helpCenterId,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const {helpCenter, fetchHelpCenterTranslations} = useCurrentHelpCenter()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [preferences, updatePreferences] = useState<
        HelpCenterPreferencesState
    >(defaultPreferences)

    const nameChanged = useMemo(() => helpCenter?.name !== preferences.name, [
        helpCenter,
        preferences,
    ])

    const defaultLanguageChanged = useMemo(
        () => helpCenter?.default_locale !== preferences.defaultLanguage,
        [helpCenter, preferences]
    )

    const supportedLanguagesChanged = useMemo(() => {
        if (!helpCenter || preferences.availableLanguages.length === 0) {
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

    const translationChanged = useMemo(() => {
        if (!helpCenter) return false

        const translation = helpCenter.translations?.find(
            (t) => t.locale === preferences.translation.locale
        )

        if (!translation) return false

        return helpCenterSeoMetaFields.some(
            (key) =>
                translation.seo_meta[key] !==
                preferences.translation.seo_meta[key]
        )
    }, [helpCenter, preferences])

    const areChangesValid = useMemo(() => !!preferences.name, [preferences])

    const savePreferences = async () => {
        if (!client || !helpCenter) return

        try {
            const {seo_meta} = preferences.translation

            await client.updateHelpCenterTranslation(
                {
                    help_center_id: helpCenterId,
                    locale: preferences.translation.locale,
                },
                {
                    seo_meta: {
                        title: seo_meta.title || null,
                        description: seo_meta.description || null,
                    },
                }
            )

            await fetchHelpCenterTranslations()

            const {data: updatedHelpCenter} = await client.updateHelpCenter(
                {help_center_id: helpCenterId},
                {
                    name: preferences.name,
                    default_locale: preferences.defaultLanguage,
                }
            )

            dispatch(helpCenterUpdated(updatedHelpCenter))

            if (defaultLanguageChanged) {
                dispatch(changeViewLanguage(updatedHelpCenter.default_locale))
            }

            void dispatch(
                notify({
                    message: 'Successfully saved the preferences',
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
                    message: `Something went wrong saving the preference${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

    const handleSupportedLocalesChange = useCallback(async () => {
        if (!client || !helpCenter) return

        // Remove unsupported locales
        await Promise.all(
            helpCenter.supported_locales.map((locale) => {
                if (!preferences.availableLanguages.includes(locale)) {
                    return client.deleteHelpCenterTranslation({
                        help_center_id: helpCenterId,
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
                            help_center_id: helpCenterId,
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
            if (helpCenter?.name) {
                draftSettings.name = helpCenter.name
            }
            if (helpCenter?.default_locale) {
                draftSettings.defaultLanguage = helpCenter.default_locale
            }
            if (helpCenter?.supported_locales) {
                draftSettings.availableLanguages = helpCenter.supported_locales
            }
            if (helpCenter?.translations) {
                draftSettings.translation =
                    helpCenter.translations?.find(
                        (t) => t.locale === viewLanguage
                    ) || getNewHelpCenterTranslation(viewLanguage)
            }
        }

        updatePreferences(produce(preferences, updateFn))
    }, [helpCenter, preferences, viewLanguage])

    useEffect(() => {
        updatePreferencesFromData()
    }, [helpCenter])

    useEffect(() => {
        if (supportedLanguagesChanged) {
            void handleSupportedLocalesChange()
        }
    }, [handleSupportedLocalesChange, supportedLanguagesChanged])

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                updatePreferences: handleOnUpdate,
                savePreferences,
                resetPreferences: updatePreferencesFromData,
                havePreferencesChanged:
                    nameChanged || defaultLanguageChanged || translationChanged,
                areChangesValid,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    )
}

export const useHelpCenterPreferencesSettings = (): HelpCenterPreferencesContext => {
    return useContext(PreferencesContext)
}
