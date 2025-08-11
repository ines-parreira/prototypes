import { useEffect, useState } from 'react'

import { CheckBoxField, Label } from '@gorgias/axiom'

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
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import TextArea from 'pages/common/forms/TextArea'

import css from './SignatureFormComponent.less'

type SignatureFormComponentProps = {
    signature: string | null
    useEmailIntegrationSignature: boolean | null
    updateValue: UpdateValue<FormValues>
    isRequired: boolean
    setIsPristine?: (isPristine: boolean) => void
}

export const SignatureFormComponent = ({
    signature,
    useEmailIntegrationSignature,
    updateValue,
    setIsPristine,
    isRequired,
}: SignatureFormComponentProps) => {
    const initialValue =
        signature !== null ? signature : INITIAL_FORM_VALUES.signature
    const [isSignatureChecked, setIsSignatureChecked] = useState<
        boolean | null
    >(false)
    useEffect(() => {
        setIsSignatureChecked(!useEmailIntegrationSignature)
    }, [useEmailIntegrationSignature])

    const [isBlurred, setIsBlurred] = useState<boolean | null>(null)
    const isSignatureValid =
        !isRequired ||
        isBlurred === false ||
        (signature && signature.trim() && signature.length > 0)

    const handleChange = <K extends keyof FormValues>(
        property: K,
        newValue: FormValues[K],
    ) => {
        if (setIsPristine) setIsPristine(false)
        updateValue(property, newValue)
        setIsBlurred(false)
    }

    return (
        <div className={css.formGroup}>
            <SettingsCard>
                <SettingsCardHeader>
                    <SettingsCardTitle
                        id="signature-text-area"
                        isRequired={false}
                    >
                        <Label>
                            Signature
                            <IconTooltip className={css.icon}>
                                This will override the current email signature
                                in your email settings.
                            </IconTooltip>
                        </Label>
                    </SettingsCardTitle>
                    <p>
                        At the end of emails you can disclose that the message
                        was created by AI, or provide a custom name for AI
                        Agent. Do not include greetings (e.g. &quot;Best
                        regards&quot;). Greetings will already be included in
                        the message above the signature.
                    </p>
                </SettingsCardHeader>
                <SettingsCardContent>
                    <CheckBoxField
                        id="signature-checkbox"
                        className={css.checkbox}
                        value={isSignatureChecked ? isSignatureChecked : false}
                        label="Use AI Agent signature"
                        onChange={(value) => {
                            const newValue = value ? false : true
                            handleChange(
                                'useEmailIntegrationSignature',
                                newValue,
                            )
                        }}
                        caption="When enabled, AI Agent signs emails using the text below. Otherwise, the signature of the respective email integration is used."
                    />
                    <TextArea
                        aria-labelledby="signature-text-area"
                        innerClassName={css.formInputEditor}
                        placeholder="AI Agent email signature"
                        value={initialValue}
                        isDisabled={!isSignatureChecked}
                        onChange={(value) => handleChange('signature', value)}
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
