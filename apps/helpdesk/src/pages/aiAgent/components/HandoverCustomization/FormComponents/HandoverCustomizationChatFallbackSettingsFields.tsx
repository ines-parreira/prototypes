import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

import { useUpdateEffect } from '@repo/hooks'
import cn from 'classnames'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import {
    getGorgiasChatLanguageByCode,
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import type { Language } from 'constants/languages'
import { Label } from 'gorgias-design-system/Input/Label'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils'
import { FlagLanguageItem } from 'pages/common/components/LanguageBulletList'
import Caption from 'pages/common/forms/Caption/Caption'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { Value } from 'pages/common/forms/SelectField/types'
import TextArea from 'pages/common/forms/TextArea'

import commonCss from './HandoverCommonSettings.less'
import css from './HandoverCustomizationChatFallbackSettings.less'

type Props = {
    values: any
    isLoading: boolean
    integrationMeta: GorgiasChatIntegration['meta']
    onFallbackMessageChange: (value: string, language: string) => void
}

const mapLocaleToSelectOption = (
    languageCode: string,
): React.ComponentProps<typeof SelectField>['options'][number] => {
    const language = getGorgiasChatLanguageByCode(languageCode as Language)

    if (!language) {
        return {
            label: languageCode,
            text: languageCode,
            value: languageCode,
        }
    }

    return {
        label: <FlagLanguageItem code={language.value} name={language.label} />,
        text: language.label,
        value: language.value,
    }
}

export const HandoverCustomizationChatFallbackSettingsFields = ({
    values,
    isLoading,
    integrationMeta,
    onFallbackMessageChange,
}: Props) => {
    const [selectedLanguageCode, setSelectedLanguageCode] = useState(
        getPrimaryLanguageFromChatConfig(integrationMeta),
    )
    const availableLanguageItems = useMemo(
        () =>
            getLanguagesFromChatConfig(integrationMeta).map(
                mapLocaleToSelectOption,
            ),
        [integrationMeta],
    )

    const onSelectedLanguageChange = useCallback(
        (value: Value) => setSelectedLanguageCode(value as string),
        [setSelectedLanguageCode],
    )

    useUpdateEffect(() => {
        setSelectedLanguageCode(
            getPrimaryLanguageFromChatConfig(integrationMeta),
        )
    }, [integrationMeta])

    if (isLoading) {
        return (
            <div
                className={cn(css.spinner, css.loadingContainer)}
                aria-busy="true"
                aria-label="Loading"
            >
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <>
            <div
                className={cn(
                    commonCss.sectionContainer,
                    commonCss.formContainer,
                )}
            >
                <div
                    className={cn(
                        'd-flex flex-row justify-content-between align-items-center mb-2',
                        css.fallbackSettingsLanguageContainer,
                    )}
                >
                    <div className="d-flex flex-row align-items-center">
                        <Label
                            htmlFor="handover-customization-fallback-message"
                            label={'Error message'}
                            className={css.fallbackMessageTitle}
                        >
                            Error Message
                        </Label>
                    </div>

                    {availableLanguageItems.length > 1 && (
                        <SelectField
                            fixedWidth
                            aria-label="Select language"
                            options={availableLanguageItems}
                            value={selectedLanguageCode}
                            onChange={onSelectedLanguageChange}
                        />
                    )}
                </div>

                <TextArea
                    id="handover-customization-fallback-message"
                    maxLength={
                        formFieldsConfiguration.fallbackMessage.maxLength
                    }
                    name="handover-customization-fallback-message"
                    aria-label="Error message"
                    role="textbox"
                    placeholder={
                        "We're experiencing a temporary issue. Please leave your email for assistance."
                    }
                    onChange={(value: string) =>
                        onFallbackMessageChange(value, selectedLanguageCode)
                    }
                    value={values[selectedLanguageCode]?.fallbackMessage}
                    rows={4}
                />

                <Caption className="caption-regular mt-1">
                    AI Agent will only send this error message when it cannot
                    request handover confirmation due to a temporary issue. By
                    default, it sends the following message: “We&apos;re
                    experiencing a temporary issue. Please leave your email for
                    assistance.”
                </Caption>
            </div>
        </>
    )
}
