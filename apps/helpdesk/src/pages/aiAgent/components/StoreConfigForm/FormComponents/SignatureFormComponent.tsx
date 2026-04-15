import { useCallback, useEffect, useState } from 'react'

import type { EditorState } from 'draft-js'

import {
    LegacyCheckBoxField as CheckBoxField,
    LegacyLabel as Label,
} from '@gorgias/axiom'

import { UploadType } from 'common/types'
import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'
import type { FormValues, UpdateValue } from 'pages/aiAgent/types'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import RichField from 'pages/common/forms/RichField/RichField'
import { convertToHTML } from 'utils/editor'

import css from './SignatureFormComponent.less'

const SIGNATURE_EDITOR_ACTIONS = [
    ActionName.Bold,
    ActionName.Italic,
    ActionName.Underline,
    ActionName.Link,
    ActionName.Image,
    ActionName.Emoji,
    ActionName.Heading,
    ActionName.BulletedList,
    ActionName.OrderedList,
]

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
    const initialSignature =
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
        useEmailIntegrationSignature === true ||
        isBlurred === false ||
        (signature && signature.trim() && signature.length > 0)

    const handleCheckboxChange = (value: boolean) => {
        const newValue = value ? false : true
        if (setIsPristine) setIsPristine(false)
        updateValue('useEmailIntegrationSignature', newValue)
    }

    const handleSignatureChange = useCallback(
        (editorState: EditorState) => {
            const contentState = editorState.getCurrentContent()
            const html = convertToHTML(contentState)

            if (setIsPristine) setIsPristine(false)
            updateValue('signature', html)
            setIsBlurred(false)
        },
        [updateValue, setIsPristine],
    )

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
                        onChange={handleCheckboxChange}
                        caption="When enabled, AI Agent signs emails using the text below. Otherwise, the signature of the respective email integration is used."
                    />
                    <div
                        className={
                            isSignatureChecked
                                ? css.editorWrapper
                                : css.editorWrapperDisabled
                        }
                    >
                        <RichField
                            allowExternalChanges
                            displayedActions={SIGNATURE_EDITOR_ACTIONS}
                            value={{
                                text: initialSignature,
                                html: initialSignature,
                            }}
                            onChange={handleSignatureChange}
                            onBlur={() => setIsBlurred(true)}
                            placeholder="AI Agent email signature"
                            uploadType={UploadType.PublicAttachment}
                        />
                    </div>
                    {!isSignatureValid && (
                        <p
                            className={`${css.formInputFooterInfo} ${css.error}`}
                        >
                            Email signature is required.
                        </p>
                    )}
                </SettingsCardContent>
            </SettingsCard>
        </div>
    )
}
