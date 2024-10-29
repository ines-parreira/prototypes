import {Label} from '@gorgias/ui-kit'
import React, {useState} from 'react'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import TextArea from 'pages/common/forms/TextArea'

import {INITIAL_FORM_VALUES, SIGNATURE_MAX_LENGTH} from '../../../constants'
import {FormValues, UpdateValue} from '../../../types'
import css from './SignatureFormComponent.less'

type SignatureFormComponentProps = {
    signature: string | null
    updateValue: UpdateValue<FormValues>
    isRequired: boolean
    setIsPristine?: (isPristine: boolean) => void
}

export const SignatureFormComponent = ({
    signature,
    updateValue,
    setIsPristine,
    isRequired,
}: SignatureFormComponentProps) => {
    const initialValue =
        signature !== null ? signature : INITIAL_FORM_VALUES.signature
    const [isBlurred, setIsBlurred] = useState<boolean | null>(null)
    const isSignatureValid =
        !isRequired ||
        isBlurred === false ||
        (signature && signature.trim() && signature.length > 0)

    const handleChange = (newValue: unknown) => {
        if (typeof newValue !== 'string') return
        if (setIsPristine) setIsPristine(false)
        updateValue('signature', newValue)
        setIsBlurred(false)
    }

    return (
        <div className={css.formGroup}>
            <Label isRequired={isRequired} className={css.subsectionHeader}>
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
                value={initialValue}
                onChange={handleChange}
                onBlur={() => setIsBlurred(true)}
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
