import React, {useMemo} from 'react'
import {EditorState} from 'draft-js'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import type {List, Map} from 'immutable'

import {UploadType} from 'common/types'
import RichField from 'pages/common/forms/RichField/RichField'
import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import {convertToHTML} from 'utils/editor'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {trimHTML} from 'utils/html'
import {IntegrationType} from 'models/integration/constants'

import {toJS} from 'utils'
import {Attachment} from 'models/ticket/types'
import {
    usePropagateError,
    useQuickResponsesViewContext,
} from '../QuickResponsesViewContext'
import {
    QUICK_RESPONSE_RESPONSE_MESSAGE_HTML_MAX_LENGTH,
    QUICK_RESPONSE_RESPONSE_MESSAGE_TEXT_MAX_LENGTH,
} from '../constants'

import css from './QuickResponseResponseMessageContent.less'

type Props = {
    responseMessageContent: QuickResponsePolicy['responseMessageContent']
    onChange: (
        responseMessageContent: QuickResponsePolicy['responseMessageContent']
    ) => void
}

const QuickResponseResponseMessageContent = ({
    responseMessageContent,
    onChange,
}: Props) => {
    const attachments = useMemo(() => {
        const attachmentsJS: (Attachment & {contentType: string})[] = toJS(
            responseMessageContent.attachments
        )

        return fromJS(
            attachmentsJS.map(({contentType, ...attachment}) => ({
                ...attachment,
                content_type: contentType,
            }))
        ) as List<Map<any, any>>
    }, [responseMessageContent.attachments])

    const hasError =
        responseMessageContent.text.length >
            QUICK_RESPONSE_RESPONSE_MESSAGE_TEXT_MAX_LENGTH ||
        responseMessageContent.html.length >
            QUICK_RESPONSE_RESPONSE_MESSAGE_HTML_MAX_LENGTH

    usePropagateError('response_message_content', hasError)

    const {storeIntegration} = useQuickResponsesViewContext()

    const handleTextChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText().trim()
        const html = convertToHTML(content)

        onChange({
            ...responseMessageContent,
            html: text.length ? html : trimHTML(html),
            text,
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
                After a customer clicks the Quick Response, the message below
                will display.
            </div>
            <ToolbarProvider
                canAddProductCard
                onAddProductCardAttachment={handleAddAttachment}
                shopifyIntegrations={fromJS(
                    storeIntegration?.type === IntegrationType.Shopify
                        ? [storeIntegration]
                        : []
                )}
            >
                <RichField
                    value={responseMessageContent}
                    allowExternalChanges
                    onChange={handleTextChange}
                    className={classnames(css.richField, {
                        [css.hasError]: hasError,
                    })}
                    maxLength={QUICK_RESPONSE_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
                    uploadType={UploadType.PublicAttachment}
                />
                <TicketAttachments
                    context="quick-reply"
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
