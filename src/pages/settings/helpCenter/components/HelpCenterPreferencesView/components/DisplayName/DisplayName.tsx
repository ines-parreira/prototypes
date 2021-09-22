import React from 'react'

import InputField from '../../../../../../common/forms/InputField'
import {useLanguagePreferencesSettings} from '../../../../providers/LanguagePreferencesSettings'

import css from './DisplayName.less'

export const DisplayName = () => {
    const {preferences, updatePreference} = useLanguagePreferencesSettings()
    const onChangeName = (name: string) => {
        updatePreference({
            name,
        })
    }
    return (
        <section className={css['display-name']}>
            <InputField
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
