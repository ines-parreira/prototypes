import { useCallback } from 'react'

import { useHistory } from 'react-router-dom'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import AutomateFormView from 'pages/automate/common/components/AutomateFormView'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { useVisualBuilderGraphReducer } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import { transformVisualBuilderGraphIntoWfConfiguration } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { transformWorkflowConfigurationIntoVisualBuilderGraph } from 'pages/automate/workflows/models/workflowConfiguration.model'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import ActionsPlatformUseCaseTemplateFormView from './components/ActionsPlatformUseCaseTemplateFormView'
import useEditActionTemplate from './hooks/useEditActionTemplate'
import useTouchActionUseCaseTemplateGraph from './hooks/useTouchActionUseCaseTemplateGraph'
import useValidateActionUseCaseTemplateGraph from './hooks/useValidateActionUseCaseTemplateGraph'
import useValidateOnVisualBuilderGraphChange from './hooks/useValidateOnVisualBuilderGraphChange'
import { ActionTemplate } from './types'

import css from './ActionsPlatformEditTemplateView.less'

type Props = {
    template: ActionTemplate
}

const ActionsPlatformEditUseCaseTemplateView = ({ template }: Props) => {
    const { isLoading: isEditActionTemplateLoading, editActionTemplate } =
        useEditActionTemplate()

    const history = useHistory()

    const { data: steps = [] } = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })

    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                template,
                true,
            ),
        ),
    )

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        false,
    )

    const { getVariableListForNode } = visualBuilderContextValue

    const handleValidate = useValidateActionUseCaseTemplateGraph(
        getVariableListForNode,
    )
    const handleTouch = useTouchActionUseCaseTemplateGraph()

    useValidateOnVisualBuilderGraphChange({
        graph: visualBuilderGraphDirty,
        handleValidate,
        dispatch,
    })

    const handleSave = useCallback(async () => {
        const graph = handleValidate(handleTouch(visualBuilderGraphDirty))

        const isErrored =
            !!graph.errors || graph.nodes.some((node) => !!node.data.errors)

        if (isErrored) {
            dispatch({
                type: 'RESET_GRAPH',
                graph,
            })

            return
        }

        const configurationDirty =
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty,
                false,
                steps,
            ) as ActionTemplate

        await editActionTemplate([
            {
                internal_id: visualBuilderGraphDirty.internal_id,
            },
            configurationDirty,
        ])

        const nextGraph = computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                configurationDirty,
                true,
            ),
        )

        dispatch({
            type: 'RESET_GRAPH',
            graph: nextGraph,
        })
    }, [
        visualBuilderGraphDirty,
        editActionTemplate,
        handleValidate,
        handleTouch,
        dispatch,
        steps,
    ])

    return (
        <AutomateFormView
            title="Actions platform"
            headerNavbarItems={[
                {
                    route: '/app/ai-agent/actions-platform/use-cases',
                    title: 'Use case templates',
                    exact: false,
                },
                {
                    route: '/app/ai-agent/actions-platform/steps',
                    title: 'Steps',
                    exact: true,
                },
                {
                    route: '/app/ai-agent/actions-platform/apps',
                    title: 'Apps',
                    exact: true,
                },
            ]}
        >
            <Button
                intent="secondary"
                fillStyle="ghost"
                className={css.backButton}
                onClick={() => {
                    history.push('/app/ai-agent/actions-platform/use-cases')
                }}
            >
                <ButtonIconLabel icon="arrow_back">
                    Back to templates
                </ButtonIconLabel>
            </Button>
            <div className={css.form}>
                <VisualBuilderContext.Provider
                    value={visualBuilderContextValue}
                >
                    <ActionsPlatformUseCaseTemplateFormView steps={steps} />
                </VisualBuilderContext.Provider>
            </div>
            <div className={css.actions}>
                <Button
                    onClick={handleSave}
                    isLoading={isEditActionTemplateLoading}
                >
                    Save changes
                </Button>
                <Button
                    intent="secondary"
                    onClick={() => {
                        history.push('/app/ai-agent/actions-platform/use-cases')
                    }}
                >
                    Cancel
                </Button>
            </div>
        </AutomateFormView>
    )
}

export default ActionsPlatformEditUseCaseTemplateView
