import { Col, Row } from 'reactstrap'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { validLocaleCode } from 'models/helpCenter/utils'
import Caption from 'pages/common/forms/Caption/Caption'
import type { Value } from 'pages/common/forms/SelectField/types'

import { useHelpCenterPreferencesSettings } from '../../../../providers/HelpCenterPreferencesSettings/HelpCenterPreferencesSettings'
import { LanguageSelect } from '../../../LanguageSelect/LanguageSelect'

import css from './DefaultLanguageSelect.less'

export const DefaultLanguageSelect: React.FC = () => {
    const { preferences, updatePreferences } =
        useHelpCenterPreferencesSettings()

    const onChangeLanguage = (value: Value) => {
        updatePreferences({
            defaultLanguage: validLocaleCode(value),
        })
    }

    return (
        <div>
            <Label className={css.label} isRequired>
                Default language
            </Label>
            <Row>
                <Col>
                    <LanguageSelect
                        value={preferences.defaultLanguage}
                        onChange={onChangeLanguage}
                        className={css.select}
                        fullWidth
                    />
                </Col>
            </Row>
            <Caption>
                {`Used when selected language isn't available or cannot be
                detected`}
            </Caption>
        </div>
    )
}
