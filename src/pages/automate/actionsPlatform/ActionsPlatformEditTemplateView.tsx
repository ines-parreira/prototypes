import React, {useCallback, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import AutomateFormView from 'pages/automate/common/components/AutomateFormView'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {useVisualBuilderGraphReducer} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {computeNodesPositions} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {transformVisualBuilderGraphIntoWfConfiguration} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from 'pages/automate/workflows/models/workflowConfiguration.model'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './ActionsPlatformEditTemplateView.less'
import ActionsPlatformTemplateFormView from './components/ActionsPlatformTemplateFormView'
import ActionsPlatformTemplateVisualBuilderView from './components/ActionsPlatformTemplateVisualBuilderView'
import useEditActionTemplate from './hooks/useEditActionTemplate'
import useTouchActionTemplateGraph from './hooks/useTouchActionTemplateGraph'
import useValidateActionTemplateGraph from './hooks/useValidateActionTemplateGraph'
import useValidateOnVisualBuilderGraphChange from './hooks/useValidateOnVisualBuilderGraphChange'
import {ActionTemplate} from './types'

type Props = {
    template: ActionTemplate
}

const ActionsPlatformEditTemplateView = ({template}: Props) => {
    const {isLoading: isEditActionTemplateLoading, editActionTemplate} =
        useEditActionTemplate()

    const history = useHistory()

    const {data: steps = []} = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })

    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                template,
                true
            )
        )
    )
    const [visualBuilderGraph, setVisualBuilderGraph] = useState(
        visualBuilderGraphDirty
    )

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        false
    )

    const {getVariableListForNode} = visualBuilderContextValue

    const handleValidate = useValidateActionTemplateGraph(
        getVariableListForNode
    )
    const handleTouch = useTouchActionTemplateGraph()

    useValidateOnVisualBuilderGraphChange({
        graph: visualBuilderGraphDirty,
        handleValidate,
        dispatch,
    })

    const handleSave = useCallback(
        async (isDraft: boolean) => {
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
                    isDraft,
                    steps
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
                    true
                )
            )

            dispatch({
                type: 'RESET_GRAPH',
                graph: nextGraph,
            })

            setVisualBuilderGraph(nextGraph)
        },
        [
            visualBuilderGraphDirty,
            editActionTemplate,
            handleValidate,
            handleTouch,
            dispatch,
            steps,
        ]
    )

    const [isEditingSteps, setIsEditingSteps] = useState(false)

    if (isEditingSteps) {
        return (
            <VisualBuilderContext.Provider value={visualBuilderContextValue}>
                <ActionsPlatformTemplateVisualBuilderView
                    visualBuilderGraph={visualBuilderGraph}
                    handleValidate={handleValidate}
                    handleTouch={handleTouch}
                    onExit={() => {
                        setIsEditingSteps(false)
                    }}
                    onSave={() => {
                        setVisualBuilderGraph(visualBuilderGraphDirty)
                    }}
                />
            </VisualBuilderContext.Provider>
        )
    }

    return (
        <AutomateFormView
            title="Actions platform"
            headerNavbarItems={[
                {
                    route: '/app/automation/actions-platform',
                    title: 'Templates',
                    exact: false,
                },
                {
                    route: '/app/automation/actions-platform/steps',
                    title: 'Steps',
                    exact: true,
                },
                {
                    route: '/app/automation/actions-platform/apps',
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
                    history.push('/app/automation/actions-platform')
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
                    <ActionsPlatformTemplateFormView
                        onEditSteps={() => {
                            setIsEditingSteps(true)
                            setVisualBuilderGraph(visualBuilderGraphDirty)
                        }}
                        steps={steps}
                    />
                </VisualBuilderContext.Provider>
            </div>
            <div className={css.actions}>
                <Button
                    onClick={() => {
                        void handleSave(visualBuilderGraph.is_draft)
                    }}
                    isLoading={isEditActionTemplateLoading}
                >
                    Save changes
                </Button>
                {visualBuilderGraph.is_draft && (
                    <Button
                        intent="secondary"
                        onClick={() => {
                            void handleSave(false)
                        }}
                        isLoading={isEditActionTemplateLoading}
                    >
                        Publish
                    </Button>
                )}
                <Button
                    intent="secondary"
                    onClick={() => {
                        history.push('/app/automation/actions-platform')
                    }}
                >
                    Cancel
                </Button>
            </div>
        </AutomateFormView>
    )
}

export default ActionsPlatformEditTemplateView
