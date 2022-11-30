import React from 'react'

import {useHelpCenterPreferencesSettings} from 'pages/settings/helpCenter/providers/HelpCenterPreferencesSettings'
import InputField from 'pages/common/forms/input/InputField'

import settingsCss from 'pages/settings/settings.less'

export const DisplayName: React.FC = () => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()
    const onChangeName = (name: string) => {
        updatePreferences({
            name,
        })
    }
    return (
        <section className={settingsCss.mb40}>
            <InputField
                type="text"
                className={settingsCss.mb16}
                name="name"
                label="Brand name"
                caption="This is going to be displayed whenever your logo isn’t available and also in search engines."
                placeholder="Ex. Customer Support"
                value={preferences.name}
                isRequired
                onChange={onChangeName}
            />
        </section>
    )
}
