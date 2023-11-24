import React, {useCallback, useMemo} from 'react'
import {MessageContent} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import TranslationPreviewHeader from 'pages/automate/workflows/components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from 'pages/automate/workflows/components/translations/TranslationPreviewField'
import {getAvailableFlowVariableListForNode} from 'pages/automate/workflows/models/variables.model'

import {AutomatedMessageNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import MessageContentFormField from '../components/MessageContentFormField'

import css from './NodeEditor.less'

export default function AutomatedMessageEditor({
    nodeInEdition,
}: {
    nodeInEdition: AutomatedMessageNodeType
}) {
    const {dispatch, visualBuilderGraph} = useWorkflowEditorContext()
    const {previewLanguage} = useTranslationsPreviewContext()
    const handleUpdateContent = useCallback(
        (content: MessageContent) => {
            dispatch({
                type: 'SET_AUTOMATED_MESSAGE_CONTENT',
                automatedMessageNodeId: nodeInEdition.id,
                content,
            })
        },
        [dispatch, nodeInEdition.id]
    )
    const availableFlowVariables = useMemo(
        () =>
            getAvailableFlowVariableListForNode(
                visualBuilderGraph,
                nodeInEdition.id
            ),
        [visualBuilderGraph, nodeInEdition.id]
    )

    return (
        <div className={css.container}>
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Message
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                    availableFlowVariables={availableFlowVariables}
                />
            </div>
            {previewLanguage && (
                <>
                    <TranslationPreviewHeader />
                    <div className={css.formField}>
                        <Label className={css.labelDisabled}>Message</Label>
                        <TranslationsPreviewField
                            nodeId={nodeInEdition.id}
                            tkey={nodeInEdition.data.content.text_tkey ?? ''}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
