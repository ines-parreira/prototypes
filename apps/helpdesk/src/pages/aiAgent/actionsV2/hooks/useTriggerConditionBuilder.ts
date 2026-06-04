import type { Dispatch } from 'react'
import { useCallback, useMemo } from 'react'

import type {
    Condition,
    LogicOperator,
} from 'pages/aiAgent/actionsV2/sidePanel/actionForm/ConditionBuilder/types'
import type { VisualBuilderGraphAction } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import type { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import type {
    LLMPromptTriggerNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {
    buildFieldsFromVariables,
    conditionsTypeFromLogicOperator,
    legacyToV2Conditions,
    logicOperatorFromConditionsType,
    makeGetOperators,
    makeGetValueOptions,
    v2ToLegacyCondition,
} from '../components/ActionConfigTab/conditionAdapters'

type Params = {
    graph: VisualBuilderGraph<LLMPromptTriggerNodeType>
    dispatch: Dispatch<VisualBuilderGraphAction>
    triggerVariables: WorkflowVariableList
}

export const useTriggerConditionBuilder = ({
    graph,
    dispatch,
    triggerVariables,
}: Params) => {
    const triggerData = graph.nodes[0].data

    const { fields, categories, variableById } = useMemo(
        () => buildFieldsFromVariables(triggerVariables),
        [triggerVariables],
    )

    const conditions = useMemo(
        () => legacyToV2Conditions(triggerData.conditions),
        [triggerData.conditions],
    )

    const logicOperator = useMemo(
        () => logicOperatorFromConditionsType(triggerData.conditionsType),
        [triggerData.conditionsType],
    )

    const getOperators = useMemo(
        () => makeGetOperators(variableById),
        [variableById],
    )

    const getValueOptions = useMemo(
        () => makeGetValueOptions(variableById),
        [variableById],
    )

    const onConditionsChange = useCallback(
        (next: Condition[]) => {
            dispatch({
                type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS',
                conditions: next.map((condition) =>
                    v2ToLegacyCondition(condition, variableById),
                ),
            })
        },
        [dispatch, variableById],
    )

    const onLogicChange = useCallback(
        (next: LogicOperator) => {
            dispatch({
                type: 'SET_LLM_PROMPT_TRIGGER_CONDITIONS_TYPE',
                conditionsType: conditionsTypeFromLogicOperator(next),
            })
        },
        [dispatch],
    )

    return {
        conditions,
        logicOperator,
        fields,
        categories,
        getOperators,
        getValueOptions,
        onConditionsChange,
        onLogicChange,
    }
}
