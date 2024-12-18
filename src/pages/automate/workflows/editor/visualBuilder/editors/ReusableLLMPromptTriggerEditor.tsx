import {Label} from '@gorgias/merchant-ui-kit'
import _noop from 'lodash/noop'
import React, {useMemo} from 'react'

import ActionFormInputs from 'pages/automate/actions/components/ActionFormInputs'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {ReusableLLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {Drawer} from 'pages/common/components/Drawer'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import CheckBox from 'pages/common/forms/CheckBox'

import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'
import {ConditionsBranchBody} from './ConditionsNodeEditor/ConditionsBranchBody'
import {buildConditionSchemaByVariableType} from './ConditionsNodeEditor/utils'

import css from './NodeEditor.less'

export default function ReusableLLMPromptTriggerEditor({
    nodeInEdition,
}: {
    nodeInEdition: ReusableLLMPromptTriggerNodeType
}) {
    const {
        dispatch,
        visualBuilderGraph,
        getVariableListForNode,
        initialVisualBuilderGraph,
        isNew,
    } = useVisualBuilderContext<ReusableLLMPromptTriggerNodeType>()

    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id]
    )

    const isDraft = visualBuilderGraph.is_draft

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.container}>
                    <CheckBox
                        isChecked={nodeInEdition.data.requires_confirmation}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
                                requiresConfirmation: nextValue,
                            })
                        }}
                        caption="Recommended for irreversible Actions. e.g.
                                    AI Agent will confirm that the customer
                                    wants to cancel a specific order before
                                    cancelling."
                    >
                        Require AI Agent to confirm with customers before
                        completing the Action
                    </CheckBox>
                    <ActionFormInputs
                        inputs={nodeInEdition.data.inputs}
                        semiImmutableInputs={
                            isNew
                                ? []
                                : initialVisualBuilderGraph.nodes[0].data.inputs
                        }
                        onAdd={() => {
                            dispatch({
                                type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
                            })
                        }}
                        onDelete={(id) => {
                            dispatch({
                                type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
                                id,
                            })
                        }}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
                                input: nextValue,
                            })
                        }}
                        errors={nodeInEdition.data.errors?.inputs}
                        onNameBlur={(id) => {
                            dispatch({
                                type: 'SET_TOUCHED',
                                nodeId: nodeInEdition.id,
                                touched: {
                                    inputs: {
                                        [id]: {
                                            name: true,
                                        },
                                    },
                                },
                            })
                        }}
                        onInstructionsBlur={(id) => {
                            dispatch({
                                type: 'SET_TOUCHED',
                                nodeId: nodeInEdition.id,
                                touched: {
                                    inputs: {
                                        [id]: {
                                            instructions: true,
                                        },
                                    },
                                },
                            })
                        }}
                    />
                    <ToolbarProvider workflowVariables={workflowVariables}>
                        <div className={css.formItem}>
                            <Label>
                                Action can only be performed according to the
                                following conditions
                            </Label>
                            <ConditionsBranchBody
                                maxConditionsTooltipMessage="You’ve reached the maximum number of conditions for this action"
                                variableDropdownProps={{
                                    noSelectedCategoryText: 'INSERT variable',
                                    dropdownPlacement: 'bottom-start',
                                }}
                                variablePickerTooltipMessage={null}
                                hasMultipleChildren
                                canDeleteBranch={false}
                                branchId={''}
                                availableVariables={workflowVariables}
                                showNoneOption
                                type={nodeInEdition.data.conditionsType}
                                conditions={nodeInEdition.data.conditions}
                                onDeleteBranch={_noop}
                                onConditionDelete={(index) => {
                                    dispatch({
                                        type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
                                        index,
                                    })
                                }}
                                onVariableSelect={(variable) => {
                                    const newCondition =
                                        buildConditionSchemaByVariableType(
                                            variable.type,
                                            variable.value
                                        )

                                    dispatch({
                                        type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
                                        condition: newCondition,
                                    })
                                }}
                                onConditionTypeChange={(_branchId, type) => {
                                    dispatch({
                                        type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
                                        conditionsType: type,
                                    })
                                }}
                                onConditionChange={(condition, index) => {
                                    dispatch({
                                        type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_CONDITION',
                                        index,
                                        condition,
                                    })
                                }}
                                isDisabled={!isDraft}
                                errors={nodeInEdition.data.errors?.conditions}
                            />
                        </div>
                    </ToolbarProvider>
                </div>
            </Drawer.Content>
        </>
    )
}
