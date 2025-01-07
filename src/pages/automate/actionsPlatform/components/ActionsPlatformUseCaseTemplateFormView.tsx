import React, {useMemo} from 'react'

import {SimplifiedStepBuilderSteps} from 'pages/aiAgent/actions/components/SimplifiedStepBuilderSteps'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {ActionTemplate} from '../types'
import ActionsPlatformTemplateConditions from './ActionsPlatformTemplateConditions'
import ActionsPlatformTemplateConfirmation from './ActionsPlatformTemplateConfirmation'
import css from './ActionsPlatformTemplateFormView.less'
import ActionsPlatformTemplateInstructions from './ActionsPlatformTemplateInstructions'
import ActionsPlatformTemplateName from './ActionsPlatformTemplateName'
import ActionsPlatformUseCaseTemplateCategory from './ActionsPlatformUseCaseTemplateCategory'

type Props = {
    steps: ActionTemplate[]
}

const ActionsPlatformUseCaseTemplateFormView = ({steps}: Props) => {
    const {visualBuilderGraph, dispatch, getVariableListForNode} =
        useVisualBuilderContext<LLMPromptTriggerNodeType>()

    const triggerNode = visualBuilderGraph.nodes[0]

    const variables = useMemo(
        () => getVariableListForNode(triggerNode.id),
        [getVariableListForNode, triggerNode.id]
    )

    return (
        <>
            <div className={css.section}>
                <ActionsPlatformUseCaseTemplateCategory
                    value={visualBuilderGraph.category}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'SET_CATEGORY',
                            category: nextValue,
                        })
                    }}
                    onBlur={() => {
                        dispatch({
                            type: 'SET_TOUCHED',
                            touched: {
                                category: true,
                            },
                        })
                    }}
                    error={visualBuilderGraph.errors?.category}
                />
                <ActionsPlatformTemplateName
                    value={visualBuilderGraph.name}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'SET_NAME',
                            name: nextValue,
                        })
                    }}
                    onBlur={() => {
                        dispatch({
                            type: 'SET_TOUCHED',
                            touched: {
                                name: true,
                            },
                        })
                    }}
                    error={visualBuilderGraph.errors?.name}
                    autoFocus={false}
                />
                <ActionsPlatformTemplateInstructions
                    error={triggerNode.data.errors?.instructions}
                    value={triggerNode.data.instructions}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'SET_LLM_PROMPT_TRIGGER_INSTRUCTIONS',
                            instructions: nextValue,
                        })
                    }}
                    onBlur={() => {
                        dispatch({
                            type: 'SET_TOUCHED',
                            nodeId: triggerNode.id,
                            touched: {
                                instructions: true,
                            },
                        })
                    }}
                />
            </div>

            <div className={css.section}>
                <ActionsPlatformTemplateConditions
                    variables={variables}
                    type={triggerNode.data.conditionsType}
                    conditions={triggerNode.data.conditions}
                    onConditionDelete={(index) => {
                        dispatch({
                            type: 'DELETE_LLM_PROMPT_TRIGGER_CONDITION',
                            index,
                        })
                    }}
                    onConditionAdd={(condition) => {
                        dispatch({
                            type: 'ADD_LLM_PROMPT_TRIGGER_CONDITION',
                            condition,
                        })
                    }}
                    onConditionTypeChange={(type) => {
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
                    onConditionBlur={(index) => {
                        dispatch({
                            type: 'SET_TOUCHED',
                            nodeId: triggerNode.id,
                            touched: {
                                conditions: {
                                    [index]: true,
                                },
                            },
                        })
                    }}
                    errors={triggerNode.data.errors?.conditions}
                />
                <ActionsPlatformTemplateConfirmation
                    steps={steps}
                    nodes={visualBuilderGraph.nodes}
                    value={triggerNode.data.requires_confirmation}
                    onChange={(nextValue) => {
                        dispatch({
                            type: 'SET_LLM_PROMPT_TRIGGER_REQUIRES_CONFIRMATION',
                            requiresConfirmation: nextValue,
                        })
                    }}
                />
            </div>

            <div className={css.section}>
                <SimplifiedStepBuilderSteps
                    graph={visualBuilderGraph}
                    dispatch={dispatch}
                    steps={steps}
                />
            </div>
        </>
    )
}

export default ActionsPlatformUseCaseTemplateFormView
