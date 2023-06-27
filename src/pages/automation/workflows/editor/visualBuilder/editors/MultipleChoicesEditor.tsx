import React, {useEffect, useMemo, useRef} from 'react'
import {EditorState} from 'draft-js'
import Immutable from 'immutable'

import Label from 'pages/common/forms/Label/Label'
import {MultipleChoicesNodeType} from 'pages/automation/workflows/models/visualBuilderGraph.types'
import {useSelfServiceStoreIntegrationContext} from 'pages/automation/common/hooks/useSelfServiceStoreIntegration'
import RichField from 'pages/common/forms/RichField/RichField'
import {convertToHTML} from 'utils/editor'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import {IntegrationType} from 'models/integration/constants'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'

import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import ReplyButtonList from '../nodes/MultipleChoicesNode/ReplyButtonList'

import css from './NodeEditor.less'

const contentTextLimit = 5000

export default function MultipleChoicesEditor({
    nodeInEdition,
}: {
    nodeInEdition: MultipleChoicesNodeType
    onClose: () => void
}) {
    const textareaRef = useRef<RichField>(null)
    useEffect(() => {
        if (!nodeInEdition.id) return
        const t = setTimeout(() => {
            textareaRef.current?.focusEditor()
        }, 300)
        return () => clearTimeout(t)
    }, [nodeInEdition.id])
    const storeIntegration = useSelfServiceStoreIntegrationContext()
    const {dispatch} = useWorkflowEditorContext()
    const choices = nodeInEdition.data.choices ?? []
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
        if (text.length > contentTextLimit) return
        dispatch({
            type: 'SET_MULTIPLE_CHOICES_CONTENT',
            multipleChoicesNodeId: nodeInEdition.id,
            content: {
                html: convertToHTML(content),
                text: text,
                attachments: nodeInEdition.data.content.attachments,
            },
        })
    }
    const handleAddAttachment = (attachment: ProductCardAttachment) => {
        dispatch({
            type: 'SET_MULTIPLE_CHOICES_CONTENT',
            multipleChoicesNodeId: nodeInEdition.id,
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
            type: 'SET_MULTIPLE_CHOICES_CONTENT',
            multipleChoicesNodeId: nodeInEdition.id,
            content: {
                ...nodeContent,
                attachments: (
                    nodeInEdition.data.content.attachments ?? []
                ).filter((_, i) => i !== index),
            },
        })
    }
    return (
        <div>
            <Label className={css.title}>Multiple choice</Label>
            <Label className={css.label} isRequired={true}>
                Question
            </Label>
            <div className={css.richFieldContainer}>
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
                        maxLength={contentTextLimit}
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
            </div>
            <Label className={css.label}>Reply buttons</Label>
            <ReplyButtonList
                nodeId={nodeInEdition.id}
                choices={choices}
                onReorderChoices={(orderedEventIds) => {
                    dispatch({
                        type: 'REORDER_CHOICES',
                        multipleChoicesNodeId: nodeInEdition.id,
                        orderedEventIds,
                    })
                }}
                onChangeChoiceLabel={(eventId, label) => {
                    dispatch({
                        type: 'SET_CHOICE_LABEL',
                        multipleChoicesNodeId: nodeInEdition.id,
                        eventId,
                        label,
                    })
                }}
                onAddChoice={() => {
                    dispatch({
                        type: 'ADD_MULTIPLE_CHOICES_CHOICE',
                        multipleChoicesNodeId: nodeInEdition.id,
                    })
                }}
            />
        </div>
    )
}
