import { useEffect, useMemo, useState } from 'react'

import classnames from 'classnames'
import { fromJS } from 'immutable'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import {
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import CampaignPreview from 'pages/convert/campaigns/components/CampaignPreview'
import { DEFAULT_THANK_YOU_MESSAGE } from 'pages/convert/campaigns/components/CampaignPreview/components/ContactCaptureFormPreview/ContactCaptureFormPreview'
import { ErrorMessage } from 'pages/convert/campaigns/components/ContactCaptureForm/styled'
import type { StepProps } from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import { useIntegrationContext } from 'pages/convert/campaigns/containers/IntegrationProvider'
import { useCampaignDetailsContext } from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import { useChatPreviewProps } from 'pages/convert/campaigns/hooks/useChatPreviewProps'
import { convertFromHTML, convertToHTML } from 'utils/editor'
import { sanitizeHtmlDefault } from 'utils/html'

import css from './PostSubmissionMessage.less'

export const PostSubmissionMessage = (props: StepProps) => {
    const messageCharacterLimit = 280
    const { attachmentData, setAttachmentData, setNextButtonActive } = props
    const [messageEnabled, setMessageEnabled] = useState(
        attachmentData.postSubmissionMessage.enabled,
    )
    const [message, setMessage] = useState(
        attachmentData.postSubmissionMessage.message,
    )

    const messagePureText = useMemo(() => {
        const blocksFromHtml = convertFromHTML(message)
        return blocksFromHtml.getPlainText()
    }, [message])

    const [onError, errorMessage] = useMemo(() => {
        if (messagePureText.length > messageCharacterLimit) {
            return [
                true,
                `The message should be under or equals to ${messageCharacterLimit} characters.`,
            ]
        }
        return [false, '']
    }, [messagePureText.length])

    const isSubmitButtonActive = useMemo(() => {
        const messageIsSet = !messageEnabled || !!message
        return messageIsSet && !onError
    }, [messageEnabled, message, onError])

    const { chatIntegration } = useIntegrationContext()
    const chatPreviewProps = useChatPreviewProps(fromJS(chatIntegration || {}))
    const { campaign } = useCampaignDetailsContext()

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
                <ToggleField
                    value={messageEnabled}
                    onChange={() => {
                        setMessageEnabled((messageEnabled) => !messageEnabled)
                    }}
                    caption="This is a message that appears once the customer has submitted their details."
                    label="Thank you message"
                />
                {messageEnabled && (
                    <div>
                        <TicketRichField
                            onChange={(data) => {
                                setMessage(
                                    convertToHTML(data.getCurrentContent()),
                                )
                            }}
                            value={{ html: message, text: message }}
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
                            maxLength={messageCharacterLimit}
                            className={classnames(css.richField, {
                                [css.onError]: onError,
                            })}
                            isRequired
                        />
                        {onError && <ErrorMessage>{errorMessage}</ErrorMessage>}
                    </div>
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
                            ? (message ?? '')
                            : DEFAULT_THANK_YOU_MESSAGE,
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
