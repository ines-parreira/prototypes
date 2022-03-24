import React from 'react'

import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {useHelpCenterPreferencesSettings} from 'pages/settings/helpCenter/providers/HelpCenterPreferencesSettings'

export const DisplayName: React.FC = () => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()
    const onChangeName = (name: string) => {
        updatePreferences({
            name,
        })
    }
    return (
        <section>
            <DEPRECATED_InputField
                type="text"
                name="name"
                label="Brand name"
                help="This is going to be displayed whenever your logo isn’t available and also in search engines."
                placeholder="Ex. Customer Support"
                value={preferences.name}
                required
                onChange={onChangeName}
            />
        </section>
    )
}
