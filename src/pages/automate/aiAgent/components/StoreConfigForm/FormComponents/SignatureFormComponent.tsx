import {Label} from '@gorgias/ui-kit'
import React, {useEffect, useState} from 'react'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import TextArea from 'pages/common/forms/TextArea'
import {INITIAL_FORM_VALUES, SIGNATURE_MAX_LENGTH} from '../../../constants'
import {FormValues, UpdateValue} from '../../../types'
import css from './SignatureFormComponent.less'

type SignatureFormComponentProps = {
    signature: string | null
    updateValue: UpdateValue<FormValues>
}

export const SignatureFormComponent = ({
    signature,
    updateValue,
}: SignatureFormComponentProps) => {
    const defaultValue =
        signature !== null ? signature : INITIAL_FORM_VALUES.signature
    const [value, setValue] = useState<string>(defaultValue)
    const isSignatureValid =
        (signature && signature.trim() && signature.length > 0) ||
        (value && value.trim().length > 0)

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    const handleChange = (newValue: unknown) => {
        if (typeof newValue !== 'string') return
        setValue(newValue)
    }

    return (
        <div className={css.formGroup}>
            <Label isRequired={true} className={css.subsectionHeader}>
                Signature
                <IconTooltip className={css.icon}>
                    This will override the current email signature in your email
                    settings.
                </IconTooltip>
            </Label>
            <TextArea
                id="signature-text-area"
                innerClassName={css.formInputEditor}
                placeholder="AI Agent email signature"
                value={value}
                onChange={handleChange}
                onBlur={() => {
                    updateValue('signature', value)
                }}
                maxLength={SIGNATURE_MAX_LENGTH}
                error={
                    !isSignatureValid
                        ? 'Email signature is required.'
                        : undefined
                }
            />
            {isSignatureValid && (
                <div className={css.formInputFooterInfo}>
                    At the end of emails you can disclose that the message was
                    created by AI, or provide a custom name for AI Agent. Do not
                    include greetings (e.g. "Best regards"). Greetings will
                    already be included in the message above the signature.
                </div>
            )}
        </div>
    )
}
