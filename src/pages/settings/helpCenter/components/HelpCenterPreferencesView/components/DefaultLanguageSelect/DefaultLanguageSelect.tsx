import React from 'react'
import {Col, Row} from 'reactstrap'

import {validLocaleCode} from '../../../../../../../models/helpCenter/utils'

import type {Value} from '../../../../../../common/forms/SelectField/types'
import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'

import {LanguageSelect} from '../../../LanguageSelect/LanguageSelect'
import css from './DefaultLanguageSelect.less'

export const DefaultLanguageSelect: React.FC = () => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()

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
                    <LanguageSelect
                        value={preferences.defaultLanguage}
                        onChange={onChangeLanguage}
                        className={css.select}
                    />
                </Col>
            </Row>
        </div>
    )
}
