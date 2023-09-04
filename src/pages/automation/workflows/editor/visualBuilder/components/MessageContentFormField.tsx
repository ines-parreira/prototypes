import React, {useEffect, useMemo, useState} from 'react'

import {EditorState} from 'draft-js'
import Immutable from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {convertToHTML} from 'utils/editor'
import RichField from 'pages/common/forms/RichField/RichField'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {IntegrationType} from 'models/integration/constants'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {useSelfServiceStoreIntegrationContext} from 'pages/automation/common/hooks/useSelfServiceStoreIntegration'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {FlowVariableList} from 'pages/automation/workflows/models/variables.types'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'

import {MessageContent} from '../../../models/workflowConfiguration.types'

import css from './MessageContentFormField.less'

type MessageContentFormFieldProps = {
    content: MessageContent
    handleUpdateContent: (content: MessageContent) => void
    availableFlowVariables?: FlowVariableList
}

const textLimit = 5000

export default function MessageContentFormField({
    content,
    handleUpdateContent,
    availableFlowVariables,
}: MessageContentFormFieldProps) {
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const {visualBuilderChoiceEventIdEditing} = useWorkflowEditorContext()
    const [textareaRef, setTextareaRef] = useState<RichField | null>(null)
    useEffect(() => {
        if (!visualBuilderChoiceEventIdEditing) {
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
    const areVariablesEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.FlowsVariables]

    const toolbarActions = useMemo(
        () => [
            ActionName.Bold,
            ActionName.Italic,
            ActionName.Underline,
            ActionName.Link,
            ActionName.Image,
            ActionName.Emoji,
            ActionName.ProductPicker,
            ...(areVariablesEnabled ? [ActionName.FlowVariable] : []),
        ],
        [areVariablesEnabled]
    )
    const attachments = useMemo(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        () => Immutable.fromJS(content.attachments ?? []),
        [content.attachments]
    )

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
                availableFlowVariables={availableFlowVariables}
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
