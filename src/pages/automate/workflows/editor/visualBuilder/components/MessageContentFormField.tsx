import {EditorState} from 'draft-js'
import Immutable from 'immutable'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {UploadType} from 'common/types'
import {IntegrationType} from 'models/integration/constants'
import {useSelfServiceStoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import RichField from 'pages/common/forms/RichField/RichField'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {convertToHTML} from 'utils/editor'

import {useVisualBuilderContext} from '../../../hooks/useVisualBuilder'
import {MessageContent} from '../../../models/workflowConfiguration.types'
import css from './MessageContentFormField.less'

type MessageContentFormFieldProps = {
    content: MessageContent
    handleUpdateContent: (content: MessageContent) => void
    workflowVariables?: WorkflowVariableList
}

const textLimit = 5000
const toolbarActions = [
    ActionName.Bold,
    ActionName.Italic,
    ActionName.Underline,
    ActionName.Link,
    ActionName.Image,
    ActionName.Emoji,
    ActionName.ProductPicker,
    ActionName.WorkflowVariable,
]

export default function MessageContentFormField({
    content,
    handleUpdateContent,
    workflowVariables,
}: MessageContentFormFieldProps) {
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const {visualBuilderGraph} = useVisualBuilderContext()
    const [textareaRef, setTextareaRef] = useState<RichField | null>(null)
    useEffect(() => {
        if (!visualBuilderGraph.nodeEditingId) {
            textareaRef?.focusEditor()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textareaRef])
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

        const convertedHTML = convertToHTML(currentContent)

        if (convertedHTML === content.html) return

        if (text.length > textLimit) return
        const {html_tkey, text_tkey} = content

        handleUpdateContent({
            html: convertedHTML,
            html_tkey,
            text: text,
            text_tkey,
            ...(typeof content.attachments === 'undefined'
                ? {}
                : {attachments: content.attachments}),
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

    const attachments = useMemo(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        () => Immutable.fromJS(content.attachments ?? []),
        [content.attachments]
    )

    const workflowVariablesRef = useRef(workflowVariables)

    workflowVariablesRef.current = workflowVariables

    const getWorkflowVariables = useCallback(() => {
        return workflowVariablesRef.current ?? []
    }, [])

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
                workflowVariables={workflowVariables}
            >
                <RichField
                    minHeight={169}
                    maxLength={textLimit}
                    ref={setTextareaRef}
                    value={richFieldValue}
                    allowExternalChanges
                    onChange={handleChange}
                    attachments={attachments}
                    displayedActions={toolbarActions}
                    noAutoScroll
                    uploadType={UploadType.PublicAttachment}
                    getWorkflowVariables={getWorkflowVariables}
                />

                <TicketAttachments
                    context="content-form"
                    className={css.attachments}
                    removable
                    attachments={Immutable.fromJS(content.attachments ?? [])}
                    deleteAttachment={handleDeleteAttachment}
                />
            </ToolbarProvider>
        </div>
    )
}
