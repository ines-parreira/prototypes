import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'
import React, {useCallback, useMemo, useState} from 'react'
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
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './ActionsPlatformEditTemplateView.less'
import ActionsPlatformTemplateAppsSelectBox from './components/ActionsPlatformTemplateAppsSelectBox'
import ActionsPlatformTemplateFormView from './components/ActionsPlatformTemplateFormView'
import ActionsPlatformTemplateVisualBuilderView from './components/ActionsPlatformTemplateVisualBuilderView'
import useApps from './hooks/useApps'
import useCreateActionTemplate from './hooks/useCreateActionTemplate'
import useTouchActionTemplateGraph from './hooks/useTouchActionTemplateGraph'
import useValidateActionTemplateGraph from './hooks/useValidateActionTemplateGraph'
import useValidateOnVisualBuilderGraphChange from './hooks/useValidateOnVisualBuilderGraphChange'
import {ActionTemplate, ActionTemplateApp} from './types'

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
        is_draft: true,
        apps: [],
        available_languages: [],
    })

    return b.build()
}

const ActionsPlatformCreateTemplateView = () => {
    const {isLoading: isCreateActionTemplateLoading, createActionTemplate} =
        useCreateActionTemplate()
    const {apps = [], isLoading: isAppsLoading, actionsApps} = useApps()

    const history = useHistory()
    const template = useMemo(() => getInitialTemplate(), [])
    const [templateApps, setTemplateApps] = useState<ActionTemplateApp[]>([])

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
        true
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

            await createActionTemplate([
                {
                    internal_id: visualBuilderGraphDirty.internal_id,
                },
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    isDraft,
                    steps
                ) as ActionTemplate,
            ])

            history.push('/app/automation/actions-platform')
        },
        [
            visualBuilderGraphDirty,
            createActionTemplate,
            handleValidate,
            handleTouch,
            history,
            steps,
            dispatch,
        ]
    )

    const [isEditingSteps, setIsEditingSteps] = useState(false)

    const selectableApps = useMemo(() => {
        const actionsAppsByAppId = _keyBy(actionsApps, 'id')

        return apps.filter(
            (app) => app.type !== 'app' || app.id in actionsAppsByAppId
        )
    }, [actionsApps, apps])

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
                        void handleSave(true)
                    }}
                    isLoading={isCreateActionTemplateLoading}
                >
                    Create Action
                </Button>
                <Button
                    intent="secondary"
                    onClick={() => {
                        void handleSave(false)
                    }}
                    isLoading={isCreateActionTemplateLoading}
                >
                    Create and publish
                </Button>
                <Button
                    intent="secondary"
                    onClick={() => {
                        history.push('/app/automation/actions-platform')
                    }}
                >
                    Cancel
                </Button>
            </div>
            <Modal
                isOpen={!visualBuilderGraphDirty.apps?.length}
                isClosable={false}
                onClose={_noop}
            >
                <ModalHeader title="Select App(s)" />
                <ModalBody>
                    <ActionsPlatformTemplateAppsSelectBox
                        apps={selectableApps}
                        value={templateApps}
                        onChange={setTemplateApps}
                        isDisabled={isAppsLoading}
                    />
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        onClick={() => {
                            dispatch({
                                type: 'SET_APPS',
                                apps: templateApps,
                            })
                        }}
                        isDisabled={!templateApps.length}
                    >
                        Use
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </AutomateFormView>
    )
}

export default ActionsPlatformCreateTemplateView
