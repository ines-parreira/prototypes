import React, {useCallback, useMemo} from 'react'
import {Label} from '@gorgias/ui-kit'

import {MultipleChoicesNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {MessageContent} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import {Drawer} from 'pages/common/components/Drawer'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'

import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from '../components/translations/TranslationPreviewField'
import MessageContentFormField from '../components/MessageContentFormField'
import ReplyButtonList from '../nodes/MultipleChoicesNode/ReplyButtonList'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function MultipleChoicesEditor({
    nodeInEdition,
}: {
    nodeInEdition: MultipleChoicesNodeType
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
    const workflowVariables = useMemo(
        () =>
            getWorkflowVariableListForNode(
                visualBuilderGraph,
                nodeInEdition.id
            ),
        [visualBuilderGraph, nodeInEdition.id]
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label className={css.label} isRequired={true}>
                            Question
                        </Label>
                        <MessageContentFormField
                            content={nodeInEdition.data.content}
                            handleUpdateContent={handleUpdateContent}
                            workflowVariables={workflowVariables}
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
                                <Label className={css.labelDisabled}>
                                    Question
                                </Label>
                                <TranslationsPreviewField
                                    nodeId={nodeInEdition.id}
                                    tkey={
                                        nodeInEdition.data.content.text_tkey ??
                                        ''
                                    }
                                />
                            </div>
                            <div className={css.formField}>
                                <Label className={css.labelDisabled}>
                                    Options
                                </Label>
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
            </Drawer.Content>
        </>
    )
}
