import {Label} from '@gorgias/merchant-ui-kit'
import _noop from 'lodash/noop'
import React, {useMemo} from 'react'

import ActionFormInputs from 'pages/automate/actions/components/ActionFormInputs'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import {ReusableLLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {getTriggerNode} from 'pages/automate/workflows/models/workflowConfiguration.model'
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
    const {dispatch, visualBuilderGraph, shouldShowErrors} =
        useVisualBuilderContext()

    const workflowVariables = useMemo(
        () =>
            getWorkflowVariableListForNode(
                visualBuilderGraph,
                nodeInEdition.id
            ),
        [visualBuilderGraph, nodeInEdition.id]
    )

    const isDraft = visualBuilderGraph.wfConfigurationOriginal.is_draft
    const initialTriggerNode = useMemo(
        () =>
            getTriggerNode(
                visualBuilderGraph.wfConfigurationOriginal
            ) as ReusableLLMPromptTriggerNodeType,
        [visualBuilderGraph.wfConfigurationOriginal]
    )

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
                        semiImmutableInputs={initialTriggerNode.data.inputs}
                        onAdd={() => {
                            dispatch({
                                type: 'ADD_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
                            })
                        }}
                        onDelete={(index) => {
                            dispatch({
                                type: 'DELETE_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
                                index,
                            })
                        }}
                        onChange={(nextValue, index) => {
                            dispatch({
                                type: 'SET_REUSABLE_LLM_PROMPT_TRIGGER_INPUT',
                                index,
                                input: nextValue,
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
                                shouldShowErrors={shouldShowErrors}
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
                            />
                        </div>
                    </ToolbarProvider>
                </div>
            </Drawer.Content>
        </>
    )
}
