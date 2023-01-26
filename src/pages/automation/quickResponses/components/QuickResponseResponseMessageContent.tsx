import React from 'react'
import {EditorState} from 'draft-js'
import {List, fromJS} from 'immutable'
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
    QUICK_RESPONSE_RESPONSE_MESSAGE_TEXT_MAX_LENGTH,
    QUICK_RESPONSE_RESPONSE_MESSAGE_HTML_MAX_LENGTH,
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

        onChange({
            ...responseMessageContent,
            html: convertToHTML(content),
            text: content.getPlainText(),
        })
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
                After shoppers click the quick response, the message below will
                display.
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
