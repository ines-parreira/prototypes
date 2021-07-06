import React from 'react'
import {useSelector} from 'react-redux'
import produce, {Draft} from 'immer'

import {readHelpcenterById} from '../../../../../state/entities/helpCenters/selectors'

export type PreferencesState = {
    defaultLanguage: string
    availableLanguages: string[]
    // TODO: add more types here as we develop the page
}

type Props = {
    children: React.ReactNode
    helpcenterId: number
}

type PreferencesContextApi = {
    preferences: PreferencesState
    updatePreference: (payload: Partial<PreferencesState>) => void
}

const defaultPreferences = {
    defaultLanguage: '',
    availableLanguages: [],
}

const PreferencesContext = React.createContext<PreferencesContextApi>({
    preferences: defaultPreferences,
    updatePreference: () => null,
})

//   This provider holds all the preference
// settings that are found in the Help Center / Preferences
export const LanguagePreferencesSettings = ({
    children,
    helpcenterId,
}: Props): JSX.Element => {
    const [preferences, updatePreference] = React.useState<PreferencesState>(
        defaultPreferences
    )
    const data = useSelector(readHelpcenterById(helpcenterId.toString()))

    const handleOnUpdate = (payload: Partial<PreferencesState>) => {
        updatePreference({
            ...preferences,
            ...payload,
        })
    }

    React.useEffect(() => {
        const updateFn = (draftSettings: Draft<PreferencesState>) => {
            if (data) {
                if (data.default_locale) {
                    draftSettings.defaultLanguage = data.default_locale
                    draftSettings.availableLanguages = [data.default_locale]
                }
                // TODO : Uncomment when API supports "supported_locales"
                // if (data.supported_locales) {
                //     draftSettings.availableLanguages = data.supported_locales
                // }
            }
        }

        updatePreference(produce(preferences, updateFn))
    }, [data])

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                updatePreference: handleOnUpdate,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    )
}

export const useLanguagePreferencesSettings = (): PreferencesContextApi => {
    return React.useContext(PreferencesContext)
}
