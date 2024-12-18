import {Label} from '@gorgias/merchant-ui-kit'
import _noop from 'lodash/noop'
import React, {useMemo, useRef, useState} from 'react'

import ActionFormInputs from 'pages/automate/actions/components/ActionFormInputs'
import VisualBuilderActionIcon from 'pages/automate/workflows/components/VisualBuilderActionIcon'
import useSplitLLMPromptTriggerInputs from 'pages/automate/workflows/hooks/useSplitLLMPromptTriggerInputs'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {WorkflowVariableGroup} from 'pages/automate/workflows/models/variables.types'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {Drawer} from 'pages/common/components/Drawer'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

export default function LLMPromptTriggerEditor({
    nodeInEdition,
}: {
    nodeInEdition: LLMPromptTriggerNodeType
}) {
    const {dispatch, visualBuilderGraph, getVariableListForNode} =
        useVisualBuilderContext()

    const [inputs, templateInputs] = useSplitLLMPromptTriggerInputs(
        nodeInEdition.data.inputs,
        visualBuilderGraph.nodes
    )

    const workflowVariables = useMemo(
        () => getVariableListForNode(nodeInEdition.id),
        [getVariableListForNode, nodeInEdition.id]
    )

    const customerVariables = workflowVariables.find(
        (variable): variable is WorkflowVariableGroup =>
            variable.nodeType === 'shopper_authentication'
    )
    const orderVariables = workflowVariables.find(
        (variable): variable is WorkflowVariableGroup =>
            variable.nodeType === 'order_selection'
    )

    const customerVariableInputRef = useRef<HTMLDivElement>(null)
    const customerVariableFloatingRef = useRef<HTMLElement>(null)

    const [isCustomerVariableOpen, setIsCustomerVariableOpen] = useState(false)

    const orderVariableInputRef = useRef<HTMLDivElement>(null)
    const orderVariableFloatingRef = useRef<HTMLElement>(null)

    const [isOrderVariableOpen, setIsOrderVariableOpen] = useState(false)

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
                <div className={css.llmPromptContainer}>
                    <div>
                        Collect information from customers to use as variables
                        in HTTP requests or conditions in this Action
                        (optional).
                    </div>
                    <div className={css.llmPromptVariables}>
                        <Label>
                            Note: the following variables are already available
                            to use in Action steps
                        </Label>
                        <SelectInputBox
                            floating={customerVariableFloatingRef}
                            onToggle={setIsCustomerVariableOpen}
                            ref={customerVariableInputRef}
                            prefix={
                                <VisualBuilderActionIcon nodeType="shopper_authentication" />
                            }
                            label={customerVariables?.name}
                        >
                            <SelectInputBoxContext.Consumer>
                                {(context) => (
                                    <Dropdown
                                        isOpen={isCustomerVariableOpen}
                                        onToggle={() => context!.onBlur()}
                                        ref={customerVariableFloatingRef}
                                        target={customerVariableInputRef}
                                    >
                                        <DropdownBody>
                                            {customerVariables?.variables.map(
                                                (option) => (
                                                    <DropdownItem
                                                        key={option.name}
                                                        option={{
                                                            label: option.name,
                                                            value: option.name,
                                                        }}
                                                        onClick={_noop}
                                                    >
                                                        <DropdownItemLabel
                                                            prefix={
                                                                <VisualBuilderActionIcon nodeType="shopper_authentication" />
                                                            }
                                                        >
                                                            {option.name}
                                                        </DropdownItemLabel>
                                                    </DropdownItem>
                                                )
                                            )}
                                        </DropdownBody>
                                    </Dropdown>
                                )}
                            </SelectInputBoxContext.Consumer>
                        </SelectInputBox>
                        <SelectInputBox
                            floating={orderVariableFloatingRef}
                            onToggle={setIsOrderVariableOpen}
                            ref={orderVariableInputRef}
                            prefix={
                                <VisualBuilderActionIcon nodeType="order_selection" />
                            }
                            label={orderVariables?.name}
                        >
                            <SelectInputBoxContext.Consumer>
                                {(context) => (
                                    <Dropdown
                                        isOpen={isOrderVariableOpen}
                                        onToggle={() => context!.onBlur()}
                                        ref={orderVariableFloatingRef}
                                        target={orderVariableInputRef}
                                    >
                                        <DropdownBody>
                                            {orderVariables?.variables.map(
                                                (option) => (
                                                    <DropdownItem
                                                        key={option.name}
                                                        option={{
                                                            label: option.name,
                                                            value: option.name,
                                                        }}
                                                        onClick={_noop}
                                                    >
                                                        <DropdownItemLabel
                                                            prefix={
                                                                <VisualBuilderActionIcon nodeType="order_selection" />
                                                            }
                                                        >
                                                            {option.name}
                                                        </DropdownItemLabel>
                                                    </DropdownItem>
                                                )
                                            )}
                                        </DropdownBody>
                                    </Dropdown>
                                )}
                            </SelectInputBoxContext.Consumer>
                        </SelectInputBox>
                    </div>
                    <ActionFormInputs
                        inputs={inputs}
                        templateInputs={templateInputs}
                        onAdd={() => {
                            dispatch({
                                type: 'ADD_LLM_PROMPT_TRIGGER_INPUT',
                            })
                        }}
                        onDelete={(id) => {
                            dispatch({
                                type: 'DELETE_LLM_PROMPT_TRIGGER_INPUT',
                                id,
                            })
                        }}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_LLM_PROMPT_TRIGGER_INPUT',
                                input: nextValue,
                            })
                        }}
                        label="Collect additional information from customers to use as variables in this Action"
                        description={null}
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
                </div>
            </Drawer.Content>
        </>
    )
}
