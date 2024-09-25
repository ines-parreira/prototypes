import React, {useEffect, useMemo, useState} from 'react'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {StepProps} from 'pages/convert/campaigns/components/ContactForm/types'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import {UploadType} from 'common/types'
import {convertToHTML} from 'utils/editor'
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
            <div className={css.previewContainer}></div>
        </div>
    )
}
