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
import {AutomatedMessageNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowConfigurationContext} from '../../../hooks/useWorkflowConfiguration'
import {useWorkflowEntrypointContext} from '../../../hooks/useWorkflowEntrypoint'

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
    const {dispatch} = useWorkflowConfigurationContext()
    const {storeIntegration} = useWorkflowEntrypointContext()
    const nodeContent = useMemo(
        () => ({
            html: nodeInEdition.data.message.content.html,
            text: nodeInEdition.data.message.content.text,
        }),
        [
            nodeInEdition.data.message.content.text,
            nodeInEdition.data.message.content.html,
        ]
    )
    const handleChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()

        if (convertToHTML(content) === nodeContent.html) return
        if (text.length > textLimit) return
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            step_id: nodeInEdition.data.step_id,
            content: {
                html: convertToHTML(content),
                text: text,
                attachments: nodeInEdition.data.message.content.attachments,
            },
        })
    }
    const handleAddAttachment = (attachment: ProductCardAttachment) => {
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            step_id: nodeInEdition.data.step_id,
            content: {
                ...nodeContent,
                attachments: [
                    ...(nodeInEdition.data.message.content.attachments ?? []),
                    attachment,
                ],
            },
        })
    }
    const handleDeleteAttachment = (index: number) => {
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            step_id: nodeInEdition.data.step_id,
            content: {
                ...nodeContent,
                attachments: (
                    nodeInEdition.data.message.content.attachments ?? []
                ).filter((_, i) => i !== index),
            },
        })
    }
    return (
        <>
            <Label isRequired={true} className={css.richFieldLabel}>
                Automated message
            </Label>
            <ToolbarProvider
                canAddProductCard={true}
                onAddProductCardAttachment={handleAddAttachment}
                canAddDiscountCodeLink={false}
                canAddVideoPlayer={false}
                shopifyIntegrations={Immutable.fromJS(
                    storeIntegration?.type === IntegrationType.Shopify
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
                        nodeInEdition.data.message.content.attachments ?? []
                    )}
                />
                <TicketAttachments
                    className={css.attachments}
                    removable
                    attachments={Immutable.fromJS(
                        nodeInEdition.data.message.content.attachments ?? []
                    )}
                    deleteAttachment={handleDeleteAttachment}
                />
            </ToolbarProvider>
        </>
    )
}
