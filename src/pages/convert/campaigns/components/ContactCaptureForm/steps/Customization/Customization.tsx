import React, {useState, useEffect, useMemo} from 'react'
import {Label} from 'reactstrap'
import {fromJS} from 'immutable'
import {Link} from 'react-router-dom'
import {StepProps} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {sanitizeHtmlDefault} from 'utils/html'
import CampaignPreview from 'pages/convert/campaigns/components/CampaignPreview'
import {useChatPreviewProps} from 'pages/convert/campaigns/hooks/useChatPreviewProps'
import {useIntegrationContext} from 'pages/convert/campaigns/containers/IntegrationProvider'
import {transformTransitoryToAttachment} from 'pages/convert/campaigns/components/ContactCaptureForm/utils'
import InputField from 'pages/common/forms/input/InputField'
import {useEmailDisclaimerSettings} from 'pages/stats/convert/hooks/useEmailDisclaimerSettings'
import css from './Customization.less'

export const Customization = (props: StepProps) => {
    const {attachmentData, setAttachmentData, setNextButtonActive} = props

    const {chatIntegration} = useIntegrationContext()
    const chatPreviewProps = useChatPreviewProps(fromJS(chatIntegration || {}))
    const {campaign} = useCampaignDetailsContext()

    const [emailFieldLabel, setEmailFieldLabel] = useState(
        attachmentData.forms.email.label
    )
    const [cta, setCta] = useState(attachmentData.forms.email.cta)
    const [nextButtonEnabled, setInnerNextButtonEnabled] = useState(false)

    const shouldEnableNextButton = useMemo(() => {
        const requiredFieldsFilled = !!emailFieldLabel && !!cta
        return requiredFieldsFilled
    }, [emailFieldLabel, cta])

    useEffect(() => {
        setAttachmentData((state) => ({
            ...state,
            forms: {
                ...state,
                email: {
                    label: emailFieldLabel,
                    cta,
                },
            },
        }))
        setInnerNextButtonEnabled(shouldEnableNextButton)
    }, [cta, emailFieldLabel, setAttachmentData, shouldEnableNextButton])

    useEffect(() => {
        setNextButtonActive(nextButtonEnabled)
    }, [nextButtonEnabled, setNextButtonActive])

    const defaultLanguage = getPrimaryLanguageFromChatConfig(
        chatIntegration?.meta
    )

    const {data: emailDisclaimerSettings} =
        useEmailDisclaimerSettings(chatIntegration)

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
                <span>
                    The privacy policy disclaimer for email capture should be
                    set in{' '}
                    <Link
                        to={`/app/convert/${chatIntegration?.id}/settings`}
                        target="_blank"
                    >
                        Settings
                    </Link>
                    .
                </span>
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
                    emailDisclaimerSettings={emailDisclaimerSettings}
                    defaultLanguage={defaultLanguage}
                />
            </div>
        </div>
    )
}
