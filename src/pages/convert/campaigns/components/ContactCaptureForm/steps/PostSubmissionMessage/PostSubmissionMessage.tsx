import React, {useEffect, useMemo, useState} from 'react'
import {fromJS} from 'immutable'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {StepProps} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import {UploadType} from 'common/types'
import {convertToHTML} from 'utils/editor'
import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {sanitizeHtmlDefault} from 'utils/html'
import CampaignPreview from 'pages/convert/campaigns/components/CampaignPreview'
import {useChatPreviewProps} from 'pages/convert/campaigns/hooks/useChatPreviewProps'
import {useIntegrationContext} from 'pages/convert/campaigns/containers/IntegrationProvider'
import {DEFAULT_THANK_YOU_MESSAGE} from 'pages/convert/campaigns/components/CampaignPreview/components/ContactCaptureFormPreview/ContactCaptureFormPreview'
import css from './PostSubmissionMessage.less'

export const PostSubmissionMessage = (props: StepProps) => {
    const {attachmentData, setAttachmentData, setNextButtonActive} = props
    const [messageEnabled, setMessageEnabled] = useState(
        attachmentData.postSubmissionMessage.enabled
    )
    const [message, setMessage] = useState(
        attachmentData.postSubmissionMessage.message
    )

    const isSubmitButtonActive = useMemo(() => {
        return !messageEnabled || !!message
    }, [messageEnabled, message])

    const {chatIntegration} = useIntegrationContext()
    const chatPreviewProps = useChatPreviewProps(fromJS(chatIntegration || {}))
    const {campaign} = useCampaignDetailsContext()

    useEffect(() => {
        setAttachmentData((state) => ({
            ...state,
            postSubmissionMessage: {
                enabled: messageEnabled,
                message,
            },
        }))
    }, [message, messageEnabled, setAttachmentData])

    useEffect(() => {
        setNextButtonActive(isSubmitButtonActive)
    }, [setNextButtonActive, isSubmitButtonActive])

    return (
        <div className={css.container}>
            <div className={css.configurationContainer}>
                <ToggleInput
                    isToggled={messageEnabled}
                    onClick={() => {
                        setMessageEnabled((messageEnabled) => !messageEnabled)
                    }}
                    caption="This is a message that appears once the customer has submitted their details."
                >
                    Thank you message
                </ToggleInput>
                {messageEnabled && (
                    <TicketRichField
                        onChange={(data) => {
                            setMessage(convertToHTML(data.getCurrentContent()))
                        }}
                        value={{html: message, text: message}}
                        placeholder={'Write your message'}
                        displayedActions={[
                            ActionName.Bold,
                            ActionName.Italic,
                            ActionName.Underline,
                            ActionName.Link,
                            ActionName.Image,
                            ActionName.Emoji,
                            ActionName.DiscountCodePicker,
                        ]}
                        uploadType={UploadType.PublicAttachment}
                        isRequired
                    />
                )}
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
                    html={sanitizeHtmlDefault(
                        messageEnabled
                            ? message ?? ''
                            : DEFAULT_THANK_YOU_MESSAGE
                    )}
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
