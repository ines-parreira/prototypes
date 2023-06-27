import React, {useEffect, useMemo, useRef} from 'react'
import {EditorState} from 'draft-js'
import Immutable from 'immutable'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {convertToHTML} from 'utils/editor'
import RichField from 'pages/common/forms/RichField/RichField'
import Label from 'pages/common/forms/Label/Label'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {IntegrationType} from 'models/integration/constants'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {useSelfServiceStoreIntegrationContext} from 'pages/automation/common/hooks/useSelfServiceStoreIntegration'

import {AutomatedMessageNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'

import css from './NodeEditor.less'

const textLimit = 5000

export default function AutomatedMessageEditor({
    nodeInEdition,
}: {
    nodeInEdition: AutomatedMessageNodeType
}) {
    const textareaRef = useRef<RichField>(null)
    useEffect(() => {
        if (!nodeInEdition) return
        const t = setTimeout(() => {
            textareaRef.current?.focusEditor()
        }, 300)
        return () => clearTimeout(t)
    }, [nodeInEdition])
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const {dispatch} = useWorkflowEditorContext()
    const nodeContent = useMemo(
        () => ({
            html: nodeInEdition.data.content.html,
            text: nodeInEdition.data.content.text,
        }),
        [nodeInEdition.data.content.text, nodeInEdition.data.content.html]
    )
    const handleChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()

        if (convertToHTML(content) === nodeContent.html) return
        if (text.length > textLimit) return
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            automatedMessageNodeId: nodeInEdition.id,
            content: {
                html: convertToHTML(content),
                text: text,
                attachments: nodeInEdition.data.content.attachments,
            },
        })
    }
    const handleAddAttachment = (attachment: ProductCardAttachment) => {
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            automatedMessageNodeId: nodeInEdition.id,
            content: {
                ...nodeContent,
                attachments: [
                    ...(nodeInEdition.data.content.attachments ?? []),
                    attachment,
                ],
            },
        })
    }
    const handleDeleteAttachment = (index: number) => {
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            automatedMessageNodeId: nodeInEdition.id,
            content: {
                ...nodeContent,
                attachments: (
                    nodeInEdition.data.content.attachments ?? []
                ).filter((_, i) => i !== index),
            },
        })
    }
    return (
        <>
            <Label className={css.title}>Automated message</Label>
            <Label className={css.label} isRequired={true}>
                Prompt
            </Label>
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
                    value={nodeContent}
                    allowExternalChanges
                    onChange={handleChange}
                    attachments={Immutable.fromJS(
                        nodeInEdition.data.content.attachments ?? []
                    )}
                />
                <TicketAttachments
                    className={css.attachments}
                    removable
                    attachments={Immutable.fromJS(
                        nodeInEdition.data.content.attachments ?? []
                    )}
                    deleteAttachment={handleDeleteAttachment}
                />
            </ToolbarProvider>
        </>
    )
}
