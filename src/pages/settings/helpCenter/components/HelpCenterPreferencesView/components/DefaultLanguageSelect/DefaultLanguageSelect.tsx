import React from 'react'
import {Col, Row} from 'reactstrap'

import {Locale} from '../../../../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../../../../models/helpCenter/utils'
import SelectField from '../../../../../../common/forms/SelectField/SelectField'
import type {Value} from '../../../../../../common/forms/SelectField/types'
import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'
import {getLocaleSelectOptions} from '../../../../utils/localeSelectOptions'

import css from './DefaultLanguageSelect.less'

type Props = {
    availableLocales: Locale[]
}

export const DefaultLanguageSelect: React.FC<Props> = ({
    availableLocales,
}: Props) => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()
    const localesOptions = getLocaleSelectOptions(
        availableLocales,
        preferences.availableLanguages
    )

    const onChangeLanguage = (value: Value) => {
        updatePreferences({
            defaultLanguage: validLocaleCode(value),
        })
    }

    return (
        <div className={css.container}>
            <h4>Default language</h4>
            <p>
                Choose a default language. This will be the default setting when
                the selected language isn't available or cannot be detected.
            </p>
            <Row>
                <Col>
                    <SelectField
                        options={localesOptions}
                        value={preferences.defaultLanguage}
                        onChange={onChangeLanguage}
                        style={{display: 'inline-block'}}
                        className={css.select}
                    />
                </Col>
            </Row>
        </div>
    )
}
