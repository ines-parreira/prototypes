import React, {useCallback, useMemo} from 'react'

import Label from 'pages/common/forms/Label/Label'
import {MultipleChoicesNodeType} from 'pages/automation/workflows/models/visualBuilderGraph.types'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import {useTranslationsPreviewContext} from 'pages/automation/workflows/hooks/useTranslationsPreviewContext'
import TranslationPreviewHeader from 'pages/automation/workflows/components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from 'pages/automation/workflows/components/translations/TranslationPreviewField'
import {getAvailableFlowVariableListForNode} from 'pages/automation/workflows/models/variables.model'

import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import ReplyButtonList from '../nodes/MultipleChoicesNode/ReplyButtonList'
import MessageContentFormField from '../components/MessageContentFormField'

import css from './NodeEditor.less'

export default function MultipleChoicesEditor({
    nodeInEdition,
}: {
    nodeInEdition: MultipleChoicesNodeType
    onClose: () => void
}) {
    const {dispatch, visualBuilderGraph} = useWorkflowEditorContext()
    const {previewLanguage} = useTranslationsPreviewContext()
    const handleUpdateContent = useCallback(
        (content: MessageContent) => {
            dispatch({
                type: 'SET_MULTIPLE_CHOICES_CONTENT',
                multipleChoicesNodeId: nodeInEdition.id,
                content,
            })
        },
        [dispatch, nodeInEdition.id]
    )
    const choices = nodeInEdition.data.choices ?? []
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
                    Question
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                    availableFlowVariables={availableFlowVariables}
                />
            </div>
            <div className={css.formField}>
                <Label className={css.label}>Options</Label>
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
            {previewLanguage && (
                <>
                    <TranslationPreviewHeader />
                    <div className={css.formField}>
                        <Label className={css.labelDisabled}>Question</Label>
                        <TranslationsPreviewField
                            nodeId={nodeInEdition.id}
                            tkey={nodeInEdition.data.content.text_tkey ?? ''}
                        />
                    </div>
                    <div className={css.formField}>
                        <Label className={css.labelDisabled}>Options</Label>
                        {choices.map((choice) => (
                            <TranslationsPreviewField
                                nodeId={nodeInEdition.id}
                                key={choice.event_id}
                                tkey={choice.label_tkey ?? ''}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
