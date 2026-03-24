import type React from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { reportError } from '@repo/logging'
import type { Draft } from 'immer'
import { produce } from 'immer'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    HelpCenter,
    HelpCenterTranslationSeoMeta,
    LocaleCode,
} from 'models/helpCenter/types'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import { useHelpCenterActions } from 'pages/settings/helpCenter/hooks/useHelpCenterActions'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {
    getNewHelpCenterTranslation,
    helpCenterSeoMetaFields,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { helpCenterUpdated } from 'state/entities/helpCenter/helpCenters/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'
import { changeViewLanguage } from 'state/ui/helpCenter/actions'

import { getGenericMessageFromError } from '../../utils'
import { useHelpCenterShopConnection } from './useHelpCenterShopConnection'

export type HelpCenterPreferencesState = {
    defaultLanguage: LocaleCode
    availableLanguages: LocaleCode[]
    seoMeta: HelpCenterTranslationSeoMeta
    connectedShop: {
        shopName: string | null
        shopIntegrationId: number | null
        selfServiceDeactivated: boolean
    }
}

type Props = { children: React.ReactNode; helpCenter: HelpCenter }

type HelpCenterPreferencesContext = {
    preferences: HelpCenterPreferencesState
    updatePreferences: (payload: Partial<HelpCenterPreferencesState>) => void
    savePreferences: () => Promise<void>
    resetPreferences: () => void
    canSavePreferences: boolean
    isSavingInProgress: boolean
}

const defaultPreferences: HelpCenterPreferencesState = {
    defaultLanguage: HELP_CENTER_DEFAULT_LOCALE,
    availableLanguages: [],
    seoMeta: { title: null, description: null },
    connectedShop: {
        shopName: null,
        shopIntegrationId: null,
        selfServiceDeactivated: false,
    },
}

const PreferencesContext = createContext<HelpCenterPreferencesContext>({
    preferences: defaultPreferences,
    updatePreferences: () => null,
    savePreferences: () => Promise.resolve(),
    resetPreferences: () => null,
    canSavePreferences: false,
    isSavingInProgress: false,
})

// This provider holds all the preferences
// settings that are found in Help Center > Preferences tab
export const HelpCenterPreferencesSettings = ({
    children,
    helpCenter,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()
    const { fetchHelpCenterTranslations } = useHelpCenterActions()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [preferences, updatePreferences] =
        useState<HelpCenterPreferencesState>(defaultPreferences)
    const [isSavingInProgress, setIsSavingInProgress] = useState(false)
    const { handleShopConnectionChange } =
        useHelpCenterShopConnection(helpCenter)

    const defaultLanguageChanged = useMemo(
        () => helpCenter.default_locale !== preferences.defaultLanguage,
        [helpCenter, preferences],
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
                    locale !== [...helpCenter.supported_locales].sort()[index],
            )
    }, [helpCenter, preferences])

    const seoChanged = useMemo(() => {
        const translation = helpCenter.translations?.find(
            (t) => t.locale === viewLanguage,
        )

        if (!translation) return false

        return helpCenterSeoMetaFields.some(
            (key) => translation.seo_meta[key] !== preferences.seoMeta[key],
        )
    }, [helpCenter.translations, preferences, viewLanguage])

    const connectedShopChanged = useMemo(
        () =>
            helpCenter.shop_name !== preferences.connectedShop.shopName ||
            Boolean(helpCenter.self_service_deactivated_datetime) !==
                preferences.connectedShop.selfServiceDeactivated,
        [helpCenter, preferences],
    )

    const canSavePreferences = useMemo(
        () => defaultLanguageChanged || seoChanged || connectedShopChanged,
        [defaultLanguageChanged, seoChanged, connectedShopChanged],
    )

    const savePreferences = useCallback(async () => {
        if (!client) return

        setIsSavingInProgress(true)
        try {
            if (seoChanged) {
                const { seoMeta } = preferences

                await client.updateHelpCenterTranslation(
                    { help_center_id: helpCenter.id, locale: viewLanguage },
                    {
                        seo_meta: {
                            title: seoMeta.title || null,
                            description: seoMeta.description || null,
                        },
                    },
                )

                await fetchHelpCenterTranslations()
            }

            if (defaultLanguageChanged) {
                const { data: updatedHelpCenter } =
                    await client.updateHelpCenter(
                        { help_center_id: helpCenter.id },
                        { default_locale: preferences.defaultLanguage },
                    )

                dispatch(helpCenterUpdated(updatedHelpCenter))

                if (defaultLanguageChanged) {
                    dispatch(
                        changeViewLanguage(updatedHelpCenter.default_locale),
                    )
                }
            }

            if (connectedShopChanged) {
                const updatedHelpCenter = await handleShopConnectionChange(
                    preferences.connectedShop,
                )
                if (updatedHelpCenter) {
                    dispatch(helpCenterUpdated(updatedHelpCenter))
                }
            }

            void dispatch(
                notify({
                    message: 'Help Center updated with success',
                    status: NotificationStatus.Success,
                }),
            )
        } catch (err) {
            const errorMessage = getGenericMessageFromError(err)

            void dispatch(
                notify({
                    message: `Could not update the Help Center: ${errorMessage}`,
                    status: NotificationStatus.Error,
                }),
            )

            reportError(err as Error)
        } finally {
            setIsSavingInProgress(false)
        }
    }, [
        client,
        seoChanged,
        preferences,
        viewLanguage,
        fetchHelpCenterTranslations,
        defaultLanguageChanged,
        helpCenter.id,
        dispatch,
        connectedShopChanged,
        handleShopConnectionChange,
    ])

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
            }),
        )

        // Add new supported locales
        await Promise.all(
            preferences.availableLanguages.map(async (locale) => {
                if (!helpCenter.supported_locales.includes(locale)) {
                    return client.createHelpCenterTranslation(
                        { help_center_id: helpCenter.id },
                        getNewHelpCenterTranslation(locale),
                    )
                }
            }),
        )

        dispatch(
            helpCenterUpdated({
                ...helpCenter,
                supported_locales: preferences.availableLanguages,
            }),
        )

        if (!preferences.availableLanguages.includes(viewLanguage)) {
            dispatch(changeViewLanguage(helpCenter.default_locale))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, helpCenter, preferences, viewLanguage])

    const handleOnUpdate = useCallback(
        (payload: Partial<HelpCenterPreferencesState>) => {
            updatePreferences({ ...preferences, ...payload })
        },
        [updatePreferences, preferences],
    )

    const updatePreferencesFromData = useCallback(() => {
        const updateFn = (draftSettings: Draft<HelpCenterPreferencesState>) => {
            draftSettings.defaultLanguage = helpCenter.default_locale
            draftSettings.availableLanguages = helpCenter.supported_locales
            draftSettings.connectedShop.shopName = helpCenter.shop_name
            draftSettings.connectedShop.shopIntegrationId =
                helpCenter.shop_integration_id
            draftSettings.connectedShop.selfServiceDeactivated = Boolean(
                helpCenter.self_service_deactivated_datetime,
            )

            const translation = helpCenter.translations?.find(
                (t) => t.locale === viewLanguage,
            )

            if (translation) {
                draftSettings.seoMeta = translation.seo_meta
            }
        }

        updatePreferences(produce(preferences, updateFn))
    }, [helpCenter, preferences, viewLanguage])

    useEffect(() => {
        updatePreferencesFromData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [helpCenter, viewLanguage])

    useEffect(() => {
        if (!helpCenter.translations) {
            void fetchHelpCenterTranslations()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (supportedLanguagesChanged) {
            void handleSupportedLocalesChange()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supportedLanguagesChanged])

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                updatePreferences: handleOnUpdate,
                savePreferences,
                resetPreferences: updatePreferencesFromData,
                canSavePreferences,
                isSavingInProgress,
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
