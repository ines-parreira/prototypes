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
                Choose the default language that will be used every time it’s
                not detected or as a second option if the selected language
                isn’t available.
            </p>
            <Row>
                <Col>
                    <SelectField
                        options={localesOptions}
                        value={preferences.defaultLanguage}
                        onChange={onChangeLanguage}
                        style={{display: 'inline-block'}}
                    />
                </Col>
            </Row>
        </div>
    )
}
