import classnames from 'classnames'

import React, {useMemo} from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import ActionsPlatformTemplateConditions from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateConditions'
import ActionsPlatformTemplateConfirmation from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateConfirmation'
import ActionsPlatformTemplateInstructions from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateInstructions'
import ActionsPlatformTemplateName from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateName'
import ActionsPlatformTemplateSteps from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplateSteps'
import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './ActionFormView.less'
import {SimplifiedStepBuilder} from './SimplifiedStepBuilder'

type Props = {
    onEditSteps: () => void
    steps: ActionTemplate[]
    isConditionsRecommendationAlertOpen?: boolean
    onConditionsRecommendationAlertClose?: () => void
}

const ActionFormView = ({
    onEditSteps,
    steps,
    isConditionsRecommendationAlertOpen,
    onConditionsRecommendationAlertClose,
}: Props) => {
    const {visualBuilderGraph, dispatch, getVariableListForNode} =
        useVisualBuilderContext<LLMPromptTriggerNodeType>()

    const triggerNode = visualBuilderGraph.nodes[0]

    const variables = useMemo(
        () => getVariableListForNode(triggerNode.id),
        [getVariableListForNode, triggerNode.id]
    )

    const isSimplifiedStepBuilderEnabled = useFlag(
        FeatureFlagKey.SimplifiedStepBuilder,
        false
    )
    const isAdvanced =
        visualBuilderGraph.advanced_datetime || !isSimplifiedStepBuilderEnabled

    return (
        <>
            <div className={css.section}>
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
                    isRecommendationAlertOpen={
                        isConditionsRecommendationAlertOpen
                    }
                    onRecommendationAlertClose={
                        onConditionsRecommendationAlertClose
                    }
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

            <div className={classnames(css.section, css.big)}>
                {isAdvanced ? (
                    <ActionsPlatformTemplateSteps
                        error={visualBuilderGraph.errors?.nodes}
                        onEditSteps={onEditSteps}
                    />
                ) : (
                    <SimplifiedStepBuilder
                        graph={visualBuilderGraph}
                        dispatch={dispatch}
                        steps={steps}
                    />
                )}
                <ToggleInput
                    isToggled={!triggerNode.data.deactivated_datetime}
                    onClick={(nextValue) => {
                        dispatch({
                            type: 'SET_LLM_PROMPT_TRIGGER_DEACTIVATED_DATETIME',
                            deactivated_datetime: nextValue
                                ? null
                                : new Date().toISOString(),
                        })
                    }}
                    caption="When enabled, you can preview this Action in the test area"
                >
                    Enable Action
                </ToggleInput>
            </div>
        </>
    )
}

export default ActionFormView
