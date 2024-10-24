import {useCallback} from 'react'

import {validateConfiguration} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {
    checkGraphVariablesValidity,
    getWorkflowVariableListForNode,
} from 'pages/automate/workflows/models/variables.model'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import {transformVisualBuilderGraphIntoWfConfiguration} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {WorkflowStep} from 'pages/automate/workflows/models/workflowConfiguration.types'

const useValidateVisualBuilderGraph = () => {
    return useCallback((graph: VisualBuilderGraph) => {
        const availableVariablesByStepId = graph.nodes.reduce<
            Record<WorkflowStep['id'], WorkflowVariableList>
        >(
            (acc, node) => ({
                ...acc,
                [node.id]: getWorkflowVariableListForNode(graph, node.id),
            }),
            {}
        )

        const configurationError = validateConfiguration(
            transformVisualBuilderGraphIntoWfConfiguration(graph),
            true,
            availableVariablesByStepId
        )

        if (configurationError) {
            return configurationError
        }

        const graphVariablesError = checkGraphVariablesValidity(graph)

        if (graphVariablesError) {
            return graphVariablesError
        }

        return null
    }, [])
}

export default useValidateVisualBuilderGraph
