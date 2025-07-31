import React, { FC } from 'react'

import { FieldErrors, UseFormSetValue } from 'react-hook-form'

import { Banner, Label } from '@gorgias/merchant-ui-kit'

import InputField from 'pages/common/forms/input/InputField'
import { SelectInputBoxContextState } from 'pages/common/forms/input/SelectInputBox'
import { HandoverHelpdeskDropdown } from 'pages/standalone/components/HandoverHelpdeskDropdown'
import css from 'pages/standalone/components/HandoverWebhookFields.less'
import { INTEGRATIONS_MAPPING } from 'pages/standalone/constants'
import { HandoverFormValues } from 'pages/standalone/schemas'
import { HelpdeskIntegrationOptions } from 'pages/standalone/types'

interface HandoverWebhookFieldsProps {
    onClick: (
        value: HelpdeskIntegrationOptions,
        context: SelectInputBoxContextState | null,
    ) => void
    webhookThirdParty: HelpdeskIntegrationOptions
    errors: FieldErrors<HandoverFormValues>
    selectedIntegration?: number
    webhookRequiredFields?: Record<string, string>
    configuredThirdParty?: string | null
    setValue: UseFormSetValue<HandoverFormValues>
}

const WebhookInputFields: FC<
    Pick<
        HandoverWebhookFieldsProps,
        'errors' | 'webhookRequiredFields' | 'setValue' | 'webhookThirdParty'
    >
> = ({ errors, webhookRequiredFields, setValue, webhookThirdParty }) => {
    return (
        <>
            {Object.entries(
                INTEGRATIONS_MAPPING[webhookThirdParty]?.requiredFields ?? {},
            ).map(([key, value]) => {
                return (
                    <InputField
                        key={key}
                        type="text"
                        label={value.label}
                        value={webhookRequiredFields?.[key] || ''}
                        onChange={(fieldValue) =>
                            setValue('webhookRequiredFields', {
                                ...webhookRequiredFields,
                                [key]: fieldValue,
                            })
                        }
                        isRequired={true}
                        error={errors.webhookRequiredFields?.[key]?.message}
                        hasError={!!errors.webhookRequiredFields?.[key]}
                    />
                )
            })}
        </>
    )
}

const HandoverWebhookFields: React.FC<HandoverWebhookFieldsProps> = ({
    onClick,
    webhookThirdParty,
    errors,
    selectedIntegration,
    webhookRequiredFields,
    configuredThirdParty,
    setValue,
}) => {
    return (
        <div className={css.container}>
            <div className={css.integrationListContainer}>
                <Label isRequired={true}>
                    Select a third-party integration
                </Label>
                <HandoverHelpdeskDropdown
                    onClick={onClick}
                    selectedThirdParty={webhookThirdParty || ''}
                    hasError={!!errors.webhookIntegration}
                    error={errors.webhookIntegration?.message}
                />
            </div>

            {selectedIntegration &&
                webhookThirdParty === configuredThirdParty && (
                    <Banner type="success">
                        Webhook already configured. Adjust the fields below to
                        edit it.
                    </Banner>
                )}
            <WebhookInputFields
                webhookThirdParty={webhookThirdParty || ''}
                webhookRequiredFields={webhookRequiredFields || {}}
                setValue={setValue}
                errors={errors}
            />
        </div>
    )
}

export default HandoverWebhookFields
