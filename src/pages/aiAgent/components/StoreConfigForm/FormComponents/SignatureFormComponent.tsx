import { useState } from 'react'

import {
    INITIAL_FORM_VALUES,
    SIGNATURE_MAX_LENGTH,
} from 'pages/aiAgent/constants'
import { FormValues, UpdateValue } from 'pages/aiAgent/types'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import TextArea from 'pages/common/forms/TextArea'

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
            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle
                        id="signature-text-area"
                        isRequired={isRequired}
                    >
                        Signature
                    </SettingsCardTitle>
                    At the end of emails you can disclose that the message was
                    created by AI, or provide a custom name for AI Agent. Do not
                    include greetings (e.g. &quot;Best regards&quot;). Greetings
                    will already be included in the message above the signature.
                </SettingsCardHeader>
                <SettingsCardContent>
                    <TextArea
                        aria-labelledby="signature-text-area"
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
                </SettingsCardContent>
            </SettingsCard>
        </div>
    )
}
