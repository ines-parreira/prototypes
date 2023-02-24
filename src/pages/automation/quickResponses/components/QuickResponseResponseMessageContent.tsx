import React from 'react'
import {EditorState} from 'draft-js'
import {fromJS, List} from 'immutable'
import classnames from 'classnames'

import RichField from 'pages/common/forms/RichField/RichField'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import {convertToHTML} from 'utils/editor'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {toImmutable} from 'utils'

import {usePropagateError} from '../QuickResponsesViewContext'
import {
    QUICK_RESPONSE_RESPONSE_MESSAGE_HTML_MAX_LENGTH,
    QUICK_RESPONSE_RESPONSE_MESSAGE_TEXT_MAX_LENGTH,
} from '../constants'

import css from './QuickResponseResponseMessageContent.less'

type Props = {
    responseMessageContent: QuickResponsePolicy['response_message_content']
    onChange: (
        responseMessageContent: QuickResponsePolicy['response_message_content']
    ) => void
}

const QuickResponseResponseMessageContent = ({
    responseMessageContent,
    onChange,
}: Props) => {
    const attachments = toImmutable<List<any>>(
        responseMessageContent.attachments ?? []
    )

    const hasError =
        responseMessageContent.text.length >
            QUICK_RESPONSE_RESPONSE_MESSAGE_TEXT_MAX_LENGTH ||
        responseMessageContent.html.length >
            QUICK_RESPONSE_RESPONSE_MESSAGE_HTML_MAX_LENGTH

    usePropagateError('response_message_content', hasError)

    const handleTextChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()

        // Trigger a change only when a plain text value has changed. This is needed because the default value of the
        // html content is an empty string, but draft-js translates it to <div><br></div>, which then creates a false positive
        // that there is a change to save.
        if (text !== responseMessageContent.text) {
            onChange({
                ...responseMessageContent,
                html: convertToHTML(content),
                text,
            })
        }
    }
    const handleAddAttachment = (attachment: ProductCardAttachment) => {
        onChange({
            ...responseMessageContent,
            attachments: attachments.push(fromJS(attachment)),
        })
    }
    const handleDeleteAttachment = (index: number) => {
        onChange({
            ...responseMessageContent,
            attachments: attachments.delete(index),
        })
    }

    return (
        <>
            <div className={css.label}>Response text</div>
            <div className={css.caption}>
                After a customer clicks the quick response, the message below
                will display.
            </div>
            <ToolbarProvider
                canAddProductCard
                onAddProductCardAttachment={handleAddAttachment}
            >
                <RichField
                    value={responseMessageContent}
                    allowExternalChanges
                    onChange={handleTextChange}
                    className={classnames(css.richField, {
                        [css.hasError]: hasError,
                    })}
                    maxLength={QUICK_RESPONSE_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
                />
                <TicketAttachments
                    className={css.attachments}
                    removable
                    attachments={attachments}
                    deleteAttachment={handleDeleteAttachment}
                />
            </ToolbarProvider>
        </>
    )
}

export default QuickResponseResponseMessageContent
