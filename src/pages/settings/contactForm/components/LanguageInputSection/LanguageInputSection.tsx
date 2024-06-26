import React, {useMemo} from 'react'
import {Label} from '@gorgias/ui-kit'

import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {LocaleCode} from 'models/helpCenter/types'
import {validLocaleCode} from 'models/helpCenter/utils'

type LanguageInputSectionProps = {
    onChange: (locale: LocaleCode) => void
    locale: LocaleCode
    customLabel?: string
}

const LanguageInputSection = ({
    onChange,
    locale,
    customLabel = 'Language',
}: LanguageInputSectionProps): JSX.Element => {
    const locales = useSupportedLocales()
    const localeOptions = useMemo(() => {
        return locales.map(({name, code}) => ({
            label: name,
            value: code,
        }))
    }, [locales])

    const onChangeLocale = (locale: Value) => onChange(validLocaleCode(locale))

    return (
        <>
            <Label
                className={contactFormCss.mbXs}
                isRequired
                htmlFor="locale-select"
            >
                {customLabel}
            </Label>
            <SelectField
                required
                fullWidth
                id="locale-select"
                value={locale}
                options={localeOptions}
                onChange={onChangeLocale}
            />
        </>
    )
}

export default LanguageInputSection
