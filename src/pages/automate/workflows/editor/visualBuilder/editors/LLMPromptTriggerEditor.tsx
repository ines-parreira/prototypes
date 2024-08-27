import React, {useMemo} from 'react'

import {Label} from '@gorgias/ui-kit'
import _noop from 'lodash/noop'
import {Drawer} from 'pages/common/components/Drawer'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import TextArea from 'pages/common/forms/TextArea'
import CheckBox from 'pages/common/forms/CheckBox'
import ActionFormInputVariable from 'pages/automate/actions/components/ActionFormInputVariable'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'

import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'
import {ConditionsBranchBody} from './ConditionsNodeEditor/ConditionsBranchBody'
import {buildConditionSchemaByVariableType} from './ConditionsNodeEditor/utils'

import css from './NodeEditor.less'

export default function LLMPromptTriggerEditor({
    nodeInEdition,
}: {
    nodeInEdition: LLMPromptTriggerNodeType
}) {
    const {dispatch, visualBuilderGraph} = useVisualBuilderContext()

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
                    <TextArea
                        className={css.formItem}
                        label="AI Agent instructions"
                        isRequired
                        placeholder="e.g. Update the customer’s shipping address with a new address"
                        caption="Describe what the Action does."
                        value={nodeInEdition.data.instructions}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS',
                                instructions: nextValue,
                            })
                        }}
                    />
                    <CheckBox
                        isChecked={nodeInEdition.data.requires_confirmation}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
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
                    <ActionFormInputVariable
                        customInputs={
                            nodeInEdition.data.custom_inputs.map((input) => ({
                                id: input.id,
                                name: input.name,
                                instructions: input.instructions,
                                dataType: input.data_type,
                            })) ?? []
                        }
                        onAddInput={() => {
                            dispatch({
                                type: 'ADD_LLM_PROMPT_TRIGGER_CUSTOM_INPUT',
                            })
                        }}
                        onDeleteInput={(index) => {
                            dispatch({
                                type: 'DELETE_LLM_PROMPT_TRIGGER_CUSTOM_INPUT',
                                index,
                            })
                        }}
                        onChange={(nextValue, index) => {
                            dispatch({
                                type: 'SET_LLM_PROMPT_TRIGGER_CUSTOM_INPUT',
                                index,
                                input: {
                                    id: nextValue.id,
                                    name: nextValue.name,
                                    instructions: nextValue.instructions,
                                    data_type: nextValue.dataType,
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
                                shouldShowErrors
                                type={nodeInEdition.data.conditionsType}
                                conditions={nodeInEdition.data.conditions}
                                onDeleteBranch={_noop}
                                onConditionDelete={(index) => {
                                    dispatch({
                                        type: 'DELETE_LLM_PROMPT_TRIGGER_CONDITION',
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
                                        type: 'ADD_LLM_PROMPT_TRIGGER_CONDITION',
                                        condition: newCondition,
                                    })
                                }}
                                onConditionTypeChange={(_branchId, type) => {
                                    dispatch({
                                        type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
                                        conditionsType: type,
                                    })
                                }}
                                onConditionChange={(condition, index) => {
                                    dispatch({
                                        type: 'SET_LLM_PROMPT_TRIGGER_CONDITION',
                                        index,
                                        condition,
                                    })
                                }}
                            />
                        </div>
                    </ToolbarProvider>
                </div>
            </Drawer.Content>
        </>
    )
}
