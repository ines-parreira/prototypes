import React, {useState, useEffect, useMemo} from 'react'
import {Label} from 'reactstrap'
import {StepProps} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import InputField from 'pages/common/forms/input/InputField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import CheckBox from 'pages/common/forms/CheckBox'
import RichField from 'pages/common/forms/RichField/RichField'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {convertToHTML} from 'utils/editor'
import css from './Customisation.less'

export const Customisation = (props: StepProps) => {
    const {attachmentData, setAttachmentData, setNextButtonActive} = props

    const [disclaimer, setDisclaimer] = useState<string>(
        attachmentData.forms.email.disclaimer
    )
    const [disclaimerEnabled, setDisclaimerEnabled] = useState(
        attachmentData.forms.email.disclaimerEnabled
    )
    const [emailFieldLabel, setEmailFieldLabel] = useState(
        attachmentData.forms.email.label
    )
    const [cta, setCta] = useState(attachmentData.forms.email.cta)
    const [preSelectDisclaimer, setPreSelectDisclaimer] = useState(
        attachmentData.forms.email.preSelectDisclaimer
    )
    const [nextButtonEnabled, setInnerNextButtonEnabled] = useState(false)

    const shouldEnableNextButton = useMemo(() => {
        const requiredFieldsFilled = !!emailFieldLabel && !!cta
        const conditionalRequiredFieldsFilled =
            !disclaimerEnabled || !!disclaimer
        return requiredFieldsFilled && conditionalRequiredFieldsFilled
    }, [emailFieldLabel, cta, disclaimerEnabled, disclaimer])

    useEffect(() => {
        setAttachmentData((state) => ({
            ...state,
            forms: {
                ...state,
                email: {
                    label: emailFieldLabel,
                    cta,
                    disclaimerEnabled,
                    disclaimer,
                    preSelectDisclaimer,
                },
            },
        }))
        setInnerNextButtonEnabled(shouldEnableNextButton)
    }, [
        disclaimer,
        disclaimerEnabled,
        cta,
        emailFieldLabel,
        preSelectDisclaimer,
        setAttachmentData,
        shouldEnableNextButton,
    ])

    useEffect(() => {
        setNextButtonActive(nextButtonEnabled)
    }, [nextButtonEnabled, setNextButtonActive])

    return (
        <div className={css.container}>
            <div className={css.configurationContainer}>
                <span className={css.title}>Email</span>
                <div className={css.inputGroup}>
                    <Label className={css.label} htmlFor="email-configuration">
                        Field Label
                    </Label>
                    <InputField
                        value={emailFieldLabel}
                        onChange={setEmailFieldLabel}
                        name="email-configuration"
                        placeholder="Email"
                        isRequired={true}
                    ></InputField>
                </div>

                <div className={css.inputGroup}>
                    <Label className={css.label} htmlFor="label-configuration">
                        Button Label
                    </Label>
                    <InputField
                        value={cta}
                        onChange={setCta}
                        name="label-configuration"
                        placeholder="Subscribe"
                        isRequired={true}
                    ></InputField>
                </div>

                <ToggleInput
                    isToggled={disclaimerEnabled}
                    onClick={() => {
                        setDisclaimerEnabled(
                            (prevDisclaimerEnabled) => !prevDisclaimerEnabled
                        )
                    }}
                >
                    Display privacy policy disclaimer
                </ToggleInput>

                {disclaimerEnabled && (
                    <RichField
                        onChange={(data) =>
                            setDisclaimer(
                                convertToHTML(data.getCurrentContent())
                            )
                        }
                        value={{
                            html: disclaimer,
                            text: disclaimer,
                        }}
                        isRequired={disclaimerEnabled}
                        canInsertInlineImages={false}
                        displayedActions={[
                            ActionName.Bold,
                            ActionName.Italic,
                            ActionName.Underline,
                            ActionName.Link,
                            ActionName.Emoji,
                        ]}
                    />
                )}

                <CheckBox
                    isChecked={preSelectDisclaimer}
                    onChange={setPreSelectDisclaimer}
                >
                    Pre-select sign-up option
                </CheckBox>
            </div>
            <div className={css.previewContainer}></div>
        </div>
    )
}
