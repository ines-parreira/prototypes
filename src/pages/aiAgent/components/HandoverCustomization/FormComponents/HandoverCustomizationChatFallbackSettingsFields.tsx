import React, { useCallback, useMemo, useState } from 'react'

import cn from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Banner, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    getGorgiasChatLanguageByCode,
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'
import { Label } from 'gorgias-design-system/Input/Label'
import useUpdateEffect from 'hooks/useUpdateEffect'
import { GorgiasChatIntegration } from 'models/integration/types'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils'
import { FlagLanguageItem } from 'pages/common/components/LanguageBulletList'
import Caption from 'pages/common/forms/Caption/Caption'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
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
    const isSettingRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]
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
            {!isSettingRevampEnabled && (
                <Banner variant="inline" className={css.fallbackBanner}>
                    Enter a message, not Guidance. It will be sent as-is to
                    customers during error.
                </Banner>
            )}

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

                        {!isSettingRevampEnabled && (
                            <IconTooltip className={css.icon} icon="info">
                                During an error, a predefined message will be
                                sent to the customer.
                            </IconTooltip>
                        )}
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

                {!isSettingRevampEnabled ? (
                    <InputField
                        id="handover-customization-fallback-message"
                        maxLength={
                            formFieldsConfiguration.fallbackMessage.maxLength
                        }
                        name="handover-customization-fallback-message"
                        aria-label="Error message"
                        role="textbox"
                        placeholder={
                            isSettingRevampEnabled
                                ? "We're experiencing a temporary issue. Please leave your email for assistance."
                                : 'Please leave your email address and we’ll get back to you.'
                        }
                        onChange={(value: string) =>
                            onFallbackMessageChange(value, selectedLanguageCode)
                        }
                        value={values[selectedLanguageCode]?.fallbackMessage}
                    />
                ) : (
                    <TextArea
                        id="handover-customization-fallback-message"
                        maxLength={
                            formFieldsConfiguration.fallbackMessage.maxLength
                        }
                        name="handover-customization-fallback-message"
                        aria-label="Error message"
                        role="textbox"
                        placeholder={
                            isSettingRevampEnabled
                                ? "We're experiencing a temporary issue. Please leave your email for assistance."
                                : 'Please leave your email address and we’ll get back to you.'
                        }
                        onChange={(value: string) =>
                            onFallbackMessageChange(value, selectedLanguageCode)
                        }
                        value={values[selectedLanguageCode]?.fallbackMessage}
                        rows={4}
                    />
                )}

                <Caption className="caption-regular mt-1">
                    {!isSettingRevampEnabled ? (
                        <>
                            If an error occurs, AI Agent will send this exact
                            message to the customer. If left blank, the default
                            message will be used:{' '}
                            <i>
                                “Please leave your email address and we’ll get
                                back to you.”
                            </i>
                        </>
                    ) : (
                        <>
                            AI Agent will send the exact text if it encounters
                            an unexpected error handing over. By default, it
                            sends the following message: “We&apos;re
                            experiencing a temporary issue. Please leave your
                            email for assistance.”
                        </>
                    )}
                </Caption>
            </div>
        </>
    )
}
