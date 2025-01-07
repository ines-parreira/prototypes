import React, {useCallback, useMemo} from 'react'
import {useHistory} from 'react-router-dom'
import {ulid} from 'ulidx'

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
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './ActionsPlatformEditTemplateView.less'
import ActionsPlatformUseCaseTemplateFormView from './components/ActionsPlatformUseCaseTemplateFormView'
import useCreateActionTemplate from './hooks/useCreateActionTemplate'
import useTouchActionUseCaseTemplateGraph from './hooks/useTouchActionUseCaseTemplateGraph'
import useValidateActionUseCaseTemplateGraph from './hooks/useValidateActionUseCaseTemplateGraph'
import useValidateOnVisualBuilderGraphChange from './hooks/useValidateOnVisualBuilderGraphChange'
import {ActionTemplate} from './types'

const getInitialTemplate = () => {
    const b = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: '',
        initialStep: {
            id: ulid(),
            kind: 'end',
            settings: {
                success: true,
            },
        },
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: '',
                    requires_confirmation: false,
                },
                deactivated_datetime: null,
            },
        ],
        triggers: [
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
            },
        ],
        is_draft: false,
        apps: [],
        available_languages: [],
        category: '',
    })

    return b.build()
}

const ActionsPlatformCreateUseCaseTemplateView = () => {
    const {isLoading: isCreateActionTemplateLoading, createActionTemplate} =
        useCreateActionTemplate()

    const history = useHistory()
    const template = useMemo(() => getInitialTemplate(), [])

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

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        true
    )

    const {getVariableListForNode} = visualBuilderContextValue

    const handleValidate = useValidateActionUseCaseTemplateGraph(
        getVariableListForNode
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

        await createActionTemplate([
            {
                internal_id: visualBuilderGraphDirty.internal_id,
            },
            transformVisualBuilderGraphIntoWfConfiguration(
                visualBuilderGraphDirty,
                false,
                steps
            ) as ActionTemplate,
        ])

        history.push('/app/automation/actions-platform/use-cases')
    }, [
        visualBuilderGraphDirty,
        createActionTemplate,
        handleValidate,
        handleTouch,
        history,
        steps,
        dispatch,
    ])

    return (
        <AutomateFormView
            title="Actions platform"
            headerNavbarItems={[
                {
                    route: '/app/automation/actions-platform',
                    title: 'Templates',
                    exact: true,
                },
                {
                    route: '/app/automation/actions-platform/use-cases',
                    title: 'Use case templates',
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
                    history.push('/app/automation/actions-platform/use-cases')
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
                    isLoading={isCreateActionTemplateLoading}
                >
                    Create Action
                </Button>
                <Button
                    intent="secondary"
                    onClick={() => {
                        history.push(
                            '/app/automation/actions-platform/use-cases'
                        )
                    }}
                >
                    Cancel
                </Button>
            </div>
        </AutomateFormView>
    )
}

export default ActionsPlatformCreateUseCaseTemplateView
