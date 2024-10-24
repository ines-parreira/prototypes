import {Label} from '@gorgias/ui-kit'
import React from 'react'

import {Locale} from 'models/helpCenter/types'

import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'

import css from './AvailableLanguagesTags.less'
import {LanguageBadgeTags} from './LanguageBadgeTags'

type Props = {
    availableLocales: Locale[]
}

export const AvailableLanguagesTags = ({availableLocales}: Props) => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()

    return (
        <div className={css.container}>
            <Label className={css.label} isRequired>
                Available languages
            </Label>
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
