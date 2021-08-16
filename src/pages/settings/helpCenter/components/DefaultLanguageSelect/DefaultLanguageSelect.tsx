import React from 'react'
import {Col, Row} from 'reactstrap'

import {HelpCenterLocale} from '../../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../../models/helpCenter/utils'

import SelectField from '../../../../common/forms/SelectField/SelectField'
import type {Value} from '../../../../common/forms/SelectField/types'

import {useLanguagePreferencesSettings} from '../../providers/LanguagePreferencesSettings'
import {useLocaleSelectOptions} from '../../hooks/useLocaleSelectOptions'

import css from './DefaultLanguageSelect.less'

type Props = {
    localesAvailable: HelpCenterLocale[]
}

export const DefaultLanguageSelect = ({localesAvailable}: Props) => {
    const {preferences, updatePreference} = useLanguagePreferencesSettings()
    const localesOptions = useLocaleSelectOptions(
        localesAvailable,
        preferences?.availableLanguages
    )

    const onChangeLanguage = (value: Value) => {
        updatePreference({
            defaultLanguage: validLocaleCode(value),
        })
    }

    return (
        <section className={css['container-default-language']}>
            <h3 className={css.title}>Languages</h3>
            <h5>Default language</h5>
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
        </section>
    )
}
