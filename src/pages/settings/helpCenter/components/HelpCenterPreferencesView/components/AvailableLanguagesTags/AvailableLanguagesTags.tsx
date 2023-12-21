import React from 'react'

import {Locale} from 'models/helpCenter/types'
import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'

import {LanguageBadgeTags} from './LanguageBadgeTags'

type Props = {
    availableLocales: Locale[]
}

export const AvailableLanguagesTags = ({availableLocales}: Props) => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()

    return (
        <div>
            <h4>Available languages</h4>
            <p>
                Select the languages in which you will be able to edit and
                customize your Help Center.
            </p>

            <LanguageBadgeTags
                availableLanguages={preferences.availableLanguages}
                availableLocales={availableLocales}
                defaultLanguage={preferences.defaultLanguage}
                updateAvailableLanguages={(availableLanguages) =>
                    updatePreferences({availableLanguages})
                }
                showModalQuestion
            />
        </div>
    )
}
