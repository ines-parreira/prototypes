import React, {useEffect, useMemo, useRef} from 'react'

import {EditorState} from 'draft-js'
import Immutable from 'immutable'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {convertToHTML} from 'utils/editor'
import RichField from 'pages/common/forms/RichField/RichField'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {IntegrationType} from 'models/integration/constants'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {useSelfServiceStoreIntegrationContext} from 'pages/automation/common/hooks/useSelfServiceStoreIntegration'

import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {MessageContent} from '../../../models/workflowConfiguration.types'

import css from './MessageContentFormField.less'

type MessageContentFormFieldProps = {
    content: MessageContent
    handleUpdateContent: (content: MessageContent) => void
}

const textLimit = 5000

export default function MessageContentFormField({
    content,
    handleUpdateContent,
}: MessageContentFormFieldProps) {
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const textareaRef = useRef<RichField>(null)
    useEffect(() => {
        const t = setTimeout(() => {
            textareaRef.current?.focusEditor()
        }, 300)
        return () => clearTimeout(t)
    }, [])
    const richFieldValue = useMemo(
        () => ({
            html: content.html,
            text: content.text,
        }),
        [content.text, content.html]
    )
    const handleChange = (editorState: EditorState) => {
        const currentContent = editorState.getCurrentContent()
        const text = currentContent.getPlainText()

        if (convertToHTML(currentContent) === content.html) return
        if (text.length > textLimit) return
        const {html_tkey, text_tkey} = content
        handleUpdateContent({
            html: convertToHTML(currentContent),
            html_tkey,
            text: text,
            text_tkey,
            attachments: content.attachments,
        })
    }
    const handleAddAttachment = (attachment: ProductCardAttachment) => {
        handleUpdateContent({
            ...content,
            attachments: [...(content.attachments ?? []), attachment],
        })
    }
    const handleDeleteAttachment = (index: number) => {
        handleUpdateContent({
            ...content,
            attachments: (content.attachments ?? []).filter(
                (_, i) => i !== index
            ),
        })
    }

    return (
        <div>
            <ToolbarProvider
                canAddProductCard={true}
                onAddProductCardAttachment={handleAddAttachment}
                canAddDiscountCodeLink={false}
                canAddVideoPlayer={false}
                shopifyIntegrations={Immutable.fromJS(
                    storeIntegration.type === IntegrationType.Shopify
                        ? [storeIntegration]
                        : []
                )}
            >
                <RichField
                    minHeight={250}
                    maxLength={textLimit}
                    ref={textareaRef}
                    value={richFieldValue}
                    displayedActions={[
                        ActionName.Bold,
                        ActionName.Italic,
                        ActionName.Underline,
                        ActionName.Link,
                        ActionName.Image,
                        ActionName.Emoji,
                        ActionName.ProductPicker,
                        // ActionName.FlowVariable, -> action is not implemented yet
                    ]}
                    allowExternalChanges
                    onChange={handleChange}
                    attachments={Immutable.fromJS(content.attachments ?? [])}
                />

                <TicketAttachments
                    className={css.attachments}
                    removable
                    attachments={Immutable.fromJS(content.attachments ?? [])}
                    deleteAttachment={handleDeleteAttachment}
                />
            </ToolbarProvider>
        </div>
    )
}
