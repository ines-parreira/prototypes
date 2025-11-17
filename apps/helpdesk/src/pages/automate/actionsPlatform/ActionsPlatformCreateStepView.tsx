import React, { useCallback, useMemo, useState } from 'react'

import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'
import { useHistory } from 'react-router-dom'
import { Container } from 'reactstrap'
import { ulid } from 'ulidx'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { useVisualBuilderGraphReducer } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import { transformVisualBuilderGraphIntoWfConfiguration } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import PageHeader from 'pages/common/components/PageHeader'
import InputField from 'pages/common/forms/input/InputField'

import ActionsPlatformStepAppSelectBox from './components/ActionsPlatformStepAppSelectBox'
import WorkflowVisualBuilder from './components/visualBuilder/WorkflowVisualBuilder'
import useApps from './hooks/useApps'
import useCreateActionTemplate from './hooks/useCreateActionTemplate'
import useTouchActionStepGraph from './hooks/useTouchActionStepGraph'
import useValidateActionStepGraph from './hooks/useValidateActionStepGraph'
import useValidateOnVisualBuilderGraphChange from './hooks/useValidateOnVisualBuilderGraphChange'
import type { ActionTemplate, ActionTemplateApp } from './types'

import css from './ActionsPlatformEditStepView.less'

const getInitialTemplate = () => {
    const b = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: '',
        initialStep: {
            id: ulid(),
            kind: 'http-request',
            settings: {
                url: '',
                method: 'GET',
                headers: {},
                name: '',
                variables: [],
            },
        },
        entrypoints: [
            {
                kind: 'reusable-llm-prompt-call-step',
                trigger: 'reusable-llm-prompt',
                settings: {
                    requires_confirmation: false,
                    conditions: null,
                },
                deactivated_datetime: null,
            },
        ],
        triggers: [
            {
                kind: 'reusable-llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
            },
        ],
        is_draft: true,
        available_languages: [],
    })
    b.insertHttpRequestConditionAndEndStepAndSelect('success', {
        success: true,
    })
    b.selectParentStep()
    b.insertHttpRequestConditionAndEndStepAndSelect('error', { success: false })

    return b.build()
}

const ActionsPlatformCreateStepView = () => {
    const { isLoading: isCreateActionTemplateLoading, createActionTemplate } =
        useCreateActionTemplate()
    const { apps = [], isLoading: isAppsLoading, actionsApps } = useApps()

    const history = useHistory()
    const template = useMemo(() => getInitialTemplate(), [])
    const [templateApp, setTemplateApp] = useState<ActionTemplateApp>()

    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                template,
                true,
            ),
        ),
    )

    const visualBuilderContextValue = useVisualBuilder(
        visualBuilderGraphDirty,
        dispatch,
        true,
    )

    const { getVariableListForNode } = visualBuilderContextValue

    const handleValidate = useValidateActionStepGraph(getVariableListForNode)
    const handleTouch = useTouchActionStepGraph()

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

            try {
                await createActionTemplate([
                    {
                        internal_id: visualBuilderGraphDirty.internal_id,
                    },
                    transformVisualBuilderGraphIntoWfConfiguration(
                        visualBuilderGraphDirty,
                        isDraft,
                        [],
                    ) as ActionTemplate,
                ])

                history.push(
                    `/app/ai-agent/actions-platform/steps/edit/${visualBuilderGraphDirty.id}`,
                )
            } catch (error) {
                // Check if this is a server validation error we can parse
                const { mapServerErrorsToGraph } = await import(
                    'pages/automate/workflows/utils/serverValidationErrors'
                )
                const graphWithServerErrors = mapServerErrorsToGraph(
                    error,
                    visualBuilderGraphDirty,
                )

                if (graphWithServerErrors) {
                    // Set the server errors on the graph to display them to the user
                    dispatch({
                        type: 'RESET_GRAPH',
                        graph: graphWithServerErrors,
                    })

                    return
                }

                // Re-throw for any other error handling
                throw error
            }
        },
        [
            visualBuilderGraphDirty,
            createActionTemplate,
            handleValidate,
            handleTouch,
            history,
            dispatch,
        ],
    )

    const selectableApps = useMemo(() => {
        const actionsAppsByAppId = _keyBy(actionsApps, 'id')

        return apps.filter(
            (app) => app.type !== 'app' || app.id in actionsAppsByAppId,
        )
    }, [actionsApps, apps])

    return (
        <div className={css.page}>
            <PageHeader
                className={css.header}
                title={
                    <InputField
                        className={css.name}
                        placeholder="e.g. Update shipping address"
                        caption="Provide a name for this Action step."
                        value={visualBuilderGraphDirty.name}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_NAME',
                                name: nextValue,
                            })
                        }}
                        error={visualBuilderGraphDirty.errors?.name}
                    />
                }
            >
                <div className={css.actions}>
                    <Button
                        intent="secondary"
                        onClick={() => {
                            history.push('/app/ai-agent/actions-platform/steps')
                        }}
                        isDisabled={
                            isCreateActionTemplateLoading || isAppsLoading
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="secondary"
                        isDisabled={
                            isCreateActionTemplateLoading || isAppsLoading
                        }
                        onClick={() => {
                            void handleSave(true)
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        intent="primary"
                        isDisabled={
                            isCreateActionTemplateLoading || isAppsLoading
                        }
                        onClick={() => {
                            void handleSave(false)
                        }}
                    >
                        Publish
                    </Button>
                </div>
            </PageHeader>
            <Container className={css.container} fluid>
                <VisualBuilderContext.Provider
                    value={visualBuilderContextValue}
                >
                    <WorkflowVisualBuilder />
                </VisualBuilderContext.Provider>
                <Modal
                    isOpen={!visualBuilderGraphDirty.apps?.length}
                    isClosable={false}
                    onClose={_noop}
                >
                    <ModalHeader title="Select App" />
                    <ModalBody>
                        <ActionsPlatformStepAppSelectBox
                            apps={selectableApps}
                            value={templateApp}
                            onChange={setTemplateApp}
                            isDisabled={isAppsLoading}
                        />
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button
                            onClick={() => {
                                if (templateApp) {
                                    dispatch({
                                        type: 'SET_APPS',
                                        apps: [templateApp],
                                    })
                                }
                            }}
                            isDisabled={!templateApp}
                        >
                            Use
                        </Button>
                    </ModalActionsFooter>
                </Modal>
            </Container>
        </div>
    )
}

export default ActionsPlatformCreateStepView
