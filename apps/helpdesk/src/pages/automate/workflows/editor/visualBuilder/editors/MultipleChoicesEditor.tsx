import React, { useCallback, useMemo } from 'react'

import { Label } from '@gorgias/axiom'

import { useTranslationsPreviewContext } from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { MultipleChoicesNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { MessageContent } from 'pages/automate/workflows/models/workflowConfiguration.types'
import { Drawer } from 'pages/common/components/Drawer'
import Caption from 'pages/common/forms/Caption/Caption'

import MessageContentFormField from '../components/MessageContentFormField'
import TranslationsPreviewField from '../components/translations/TranslationPreviewField'
import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'
import ReplyButtonList from '../nodes/MultipleChoicesNode/ReplyButtonList'

import css from './NodeEditor.less'

export default function MultipleChoicesEditor({
    nodeInEdition,
}: {
    nodeInEdition: MultipleChoicesNodeType
}) {
    const { dispatch, getVariableListForNode } = useVisualBuilderContext()
    const { previewLanguage } = useTranslationsPreviewContext()
    const handleUpdateContent = useCallback(
        (content: MessageContent) => {
            dispatch({
                type: 'SET_MULTIPLE_CHOICES_CONTENT',
                multipleChoicesNodeId: nodeInEdition.id,
                content,
            })
        },
        [dispatch, nodeInEdition.id],
    )
    const choices = nodeInEdition.data.choices ?? []
    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id],
    )

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <div className={css.formField}>
                        <Label isRequired>Question</Label>
                        <div>
                            <MessageContentFormField
                                content={nodeInEdition.data.content}
                                handleUpdateContent={handleUpdateContent}
                                workflowVariables={workflowVariables}
                                onBlur={() => {
                                    dispatch({
                                        type: 'SET_TOUCHED',
                                        nodeId: nodeInEdition.id,
                                        touched: {
                                            content: true,
                                        },
                                    })
                                }}
                            />
                            {!!nodeInEdition.data.errors?.content && (
                                <Caption
                                    error={nodeInEdition.data.errors.content}
                                />
                            )}
                        </div>
                    </div>
                    <div className={css.formField}>
                        <Label>Options</Label>
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
                            workflowVariables={workflowVariables}
                            errors={nodeInEdition.data.errors?.choices}
                            onBlur={(eventId) => {
                                dispatch({
                                    type: 'SET_TOUCHED',
                                    nodeId: nodeInEdition.id,
                                    touched: {
                                        choices: {
                                            [eventId]: {
                                                label: true,
                                            },
                                        },
                                    },
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
