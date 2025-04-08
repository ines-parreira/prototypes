import React, { useCallback, useEffect, useMemo, useState } from 'react'

import cn from 'classnames'

import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import {
    getGorgiasChatLanguageByCode,
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'
import { Label } from 'gorgias-design-system/Input/Label'
import useUpdateEffect from 'hooks/useUpdateEffect'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils'
import { FlagLanguageItem } from 'pages/common/components/LanguageBulletList'
import Caption from 'pages/common/forms/Caption/Caption'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
import TextArea from 'pages/common/forms/TextArea'

import css from './HandoverCustomizationFallbackSettings.less'

type Props = {
    integration: GorgiasChatIntegration
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

const HandoverCustomizationFallbackSettings = ({ integration }: Props) => {
    const [selectedLanguageCode, setSelectedLanguageCode] = useState(
        getPrimaryLanguageFromChatConfig(integration.meta),
    )

    const {
        formValues,
        updateValue,
        hasChanges,
        handleOnSave,
        handleOnCancel,
        isLoading,
        isSaving,
    } = useHandoverCustomizationChatFallbackSettingsForm({
        integration,
    })

    const { setIsFormDirty, setActionCallback } = useAiAgentFormChangesContext()

    const availableLanguageItems = useMemo(
        () =>
            getLanguagesFromChatConfig(integration.meta).map(
                mapLocaleToSelectOption,
            ),
        [integration],
    )

    const onFallbackMessageChange = useCallback(
        (value: string) => {
            updateValue('fallbackMessage', selectedLanguageCode, value)
        },
        [updateValue, selectedLanguageCode],
    )

    const onSelectedLanguageChange = useCallback(
        (value: Value) => {
            setSelectedLanguageCode(value as string)
        },
        [setSelectedLanguageCode],
    )

    const onSave = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            handleOnSave()
        },
        [handleOnSave],
    )

    const onCancel = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            handleOnCancel()
        },
        [handleOnCancel],
    )

    useUpdateEffect(() => {
        setSelectedLanguageCode(
            getPrimaryLanguageFromChatConfig(integration.meta),
        )
    }, [integration])

    useEffect(() => {
        setIsFormDirty(
            StoreConfigFormSection.handoverCustomizationFallbackSettings,
            hasChanges,
        )
    }, [hasChanges, setIsFormDirty])

    useEffect(() => {
        setActionCallback(
            StoreConfigFormSection.handoverCustomizationFallbackSettings,
            {
                onDiscard: handleOnCancel,
            },
        )
    }, [setActionCallback, handleOnCancel])

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
            <div className={cn(css.fallbackSettingsContainer, 'mb-5')}>
                <div
                    className={cn(
                        'd-flex flex-row justify-content-between align-items-center mb-2',
                        css.fallbackSettingsLanguageContainer,
                    )}
                >
                    <Label
                        htmlFor="handover-customization-fallback-message"
                        label={'Error message'}
                        className={css.fallbackMessageTitle}
                    >
                        Error Message
                    </Label>

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
                    rows={5}
                    maxLength={
                        formFieldsConfiguration.fallbackMessage.maxLength
                    }
                    name="handover-customization-fallback-message"
                    aria-label="Error message"
                    role="textbox"
                    placeholder="We're experiencing a temporary issue. Please leave your email for assistance."
                    onChange={onFallbackMessageChange}
                    value={formValues[selectedLanguageCode]?.fallbackMessage}
                />
                <Caption className="caption-regular mt-1">
                    AI Agent will send the exact text if it encounters an
                    unexpected error handing over. By default, it sends the
                    following message:{' '}
                    <i>
                        “We’re experiencing a temporary issue. Please leave your
                        email for assistance.”
                    </i>
                </Caption>
            </div>

            <section className="mb-0">
                <Button
                    type="submit"
                    color="primary"
                    className="mr-2"
                    size="small"
                    onClick={onSave}
                    isDisabled={isSaving}
                >
                    Save Changes
                </Button>

                <Button
                    intent="secondary"
                    color="secondary"
                    size="small"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </section>
        </>
    )
}

export default HandoverCustomizationFallbackSettings
