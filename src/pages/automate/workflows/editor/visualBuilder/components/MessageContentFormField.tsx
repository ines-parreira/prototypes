import React, {useEffect, useMemo, useState} from 'react'

import {EditorState} from 'draft-js'
import Immutable from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {UploadType} from 'common/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {convertToHTML} from 'utils/editor'
import RichField from 'pages/common/forms/RichField/RichField'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {IntegrationType} from 'models/integration/constants'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {useSelfServiceStoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {FlowVariableList} from 'pages/automate/workflows/models/variables.types'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'

import UploadingSensitiveInformationDisclaimer from 'pages/automate/common/components/UploadingSensitiveInformationDisclaimer'
import {FeatureFlagKey} from 'config/featureFlags'
import {MessageContent} from '../../../models/workflowConfiguration.types'

import css from './MessageContentFormField.less'

type MessageContentFormFieldProps = {
    content: MessageContent
    handleUpdateContent: (content: MessageContent) => void
    availableFlowVariables?: FlowVariableList
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
    ActionName.FlowVariable,
]

export default function MessageContentFormField({
    content,
    handleUpdateContent,
    availableFlowVariables,
}: MessageContentFormFieldProps) {
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const {visualBuilderChoiceEventIdEditing} = useWorkflowEditorContext()
    const [textareaRef, setTextareaRef] = useState<RichField | null>(null)
    const showAttachmentUploadDisclaimer =
        useFlags()[FeatureFlagKey.AutomateShowAttachmentUploadDisclaimer]
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
                    uploadType={UploadType.PublicAttachment}
                />

                <TicketAttachments
                    className={css.attachments}
                    removable
                    attachments={Immutable.fromJS(content.attachments ?? [])}
                    deleteAttachment={handleDeleteAttachment}
                />
            </ToolbarProvider>

            {showAttachmentUploadDisclaimer && (
                <UploadingSensitiveInformationDisclaimer
                    className="mt-4 mb-2"
                    message="If you're uploading images, make sure they don't contain sensitive information."
                />
            )}
        </div>
    )
}
