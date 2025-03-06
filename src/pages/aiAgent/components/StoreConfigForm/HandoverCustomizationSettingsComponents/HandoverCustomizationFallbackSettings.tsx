import React from 'react'

import cn from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import { Label } from 'gorgias-design-system/Input/Label'
import { Locale } from 'models/helpCenter/types'
import { FlagLanguageItem } from 'pages/common/components/LanguageBulletList'
import Caption from 'pages/common/forms/Caption/Caption'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TextArea from 'pages/common/forms/TextArea'

import css from './HandoverCustomizationFallbackSettings.less'

// this language options will be replaced in the next PR with the logic that uses the integration id to get the language options
const languagePickerOptions: Locale[] = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
]

const localeToSelectOption = (
    locale: Locale,
): React.ComponentProps<typeof SelectField>['options'][number] => ({
    label: (
        <FlagLanguageItem
            code={locale.code}
            name={`${locale.name} - ${locale.code}`}
        />
    ),
    text: `${locale.name} - ${locale.code}`,
    value: locale.code,
})

/// This component will be finished in the next PR. - until it the actions will be implemented with empty functions.

const HandoverCustomizationFallbackSettings = () => {
    return (
        <div>
            <div className={cn(css.fallbackSettingsContainer, 'mb-5')}>
                <div className="d-flex flex-row justify-content-between align-items-center mb-2">
                    <Label
                        htmlFor="handover-customization-error-message"
                        label={'Error message'}
                        className={css.errorMessageTitle}
                    >
                        Error Message
                    </Label>

                    <SelectField
                        options={languagePickerOptions.map(
                            localeToSelectOption,
                        )}
                        value={'en-US'}
                        onChange={() => {}}
                    />
                </div>

                <TextArea
                    id="handover-customization-error-message"
                    rows={5}
                    name="handover-customization-error-message"
                    aria-label="Error message"
                    placeholder={`Thanks for reaching out, we'll get back to you as soon as possible.`}
                    onChange={() => {}}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    AI Agent will send the exact text if it encounters an
                    unexpected error handing over. By default, it sends the
                    following message:{' '}
                    <i>
                        “Thanks for reaching out, we’ll get back to you as soon
                        as possible.”
                    </i>
                </Caption>
            </div>

            <section className="mb-0">
                <Button
                    type="submit"
                    color="primary"
                    className="mr-2"
                    size="small"
                    onClick={() => {}}
                >
                    Save Changes
                </Button>

                <Button
                    intent="secondary"
                    color="secondary"
                    size="small"
                    onClick={() => {}}
                >
                    Cancel
                </Button>
            </section>
        </div>
    )
}

export default HandoverCustomizationFallbackSettings
