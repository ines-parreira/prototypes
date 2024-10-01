import React, {useState, useEffect, useMemo} from 'react'
import {Label} from 'reactstrap'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {StepProps} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import InputField from 'pages/common/forms/input/InputField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import CheckBox from 'pages/common/forms/CheckBox'
import RichField from 'pages/common/forms/RichField/RichField'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {convertFromHTML, convertToHTML} from 'utils/editor'
import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {sanitizeHtmlDefault} from 'utils/html'
import CampaignPreview from 'pages/convert/campaigns/components/CampaignPreview'
import {useChatPreviewProps} from 'pages/convert/campaigns/hooks/useChatPreviewProps'
import {useIntegrationContext} from 'pages/convert/campaigns/containers/IntegrationProvider'
import {transformTransitoryToAttachment} from 'pages/convert/campaigns/components/ContactCaptureForm/utils'
import {ErrorMessage} from 'pages/convert/campaigns/components/ContactCaptureForm/styled'
import css from './Customisation.less'

export const Customisation = (props: StepProps) => {
    const disclaimerCharacterLimit = 280
    const {attachmentData, setAttachmentData, setNextButtonActive} = props

    const {chatIntegration} = useIntegrationContext()
    const chatPreviewProps = useChatPreviewProps(fromJS(chatIntegration || {}))
    const {campaign} = useCampaignDetailsContext()

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

    const disclaimerPureText = useMemo(() => {
        const blocksFromHtml = convertFromHTML(disclaimer)
        return blocksFromHtml.getPlainText()
    }, [disclaimer])

    const [onError, errorMessage] = useMemo(() => {
        if (disclaimerPureText.length > disclaimerCharacterLimit) {
            return [
                true,
                `The disclaimer should be under or equals to ${disclaimerCharacterLimit} characters.`,
            ]
        }
        return [false, '']
    }, [disclaimerPureText])

    const shouldEnableNextButton = useMemo(() => {
        const requiredFieldsFilled = !!emailFieldLabel && !!cta
        const conditionalRequiredFieldsFilled =
            !disclaimerEnabled || !!disclaimer
        return (
            requiredFieldsFilled && conditionalRequiredFieldsFilled && !onError
        )
    }, [emailFieldLabel, cta, disclaimerEnabled, disclaimer, onError])

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
                    <div>
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
                            maxLength={disclaimerCharacterLimit}
                            className={classnames(css.richField, {
                                [css.onError]: onError,
                            })}
                        />
                        {onError && <ErrorMessage>{errorMessage}</ErrorMessage>}
                    </div>
                )}

                <CheckBox
                    isChecked={preSelectDisclaimer}
                    onChange={setPreSelectDisclaimer}
                >
                    Pre-select sign-up option
                </CheckBox>
            </div>
            <div className={css.previewContainer}>
                <CampaignPreview
                    {...chatPreviewProps}
                    translatedTexts={
                        campaign.language
                            ? GORGIAS_CHAT_WIDGET_TEXTS[campaign.language]
                            : chatPreviewProps.translatedTexts
                    }
                    className={css.campaignPreview}
                    contactCaptureForm={transformTransitoryToAttachment(
                        attachmentData
                    )}
                    html={sanitizeHtmlDefault(campaign.message_html || '')}
                    authorName={campaign.meta?.agentName ?? ``}
                    authorAvatarUrl={campaign.meta?.agentAvatarUrl ?? ''}
                    chatTitle={chatIntegration?.name ?? ''}
                    mainFontFamily={
                        chatPreviewProps.mainFontFamily ??
                        GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                    }
                    shouldHideReplyInput={!!campaign.meta?.noReply}
                    onCampaignContentChange={() => {}}
                />
            </div>
        </div>
    )
}
