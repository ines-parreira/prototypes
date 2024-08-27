import React, {useCallback, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {useHistory} from 'react-router-dom'
import {ulid} from 'ulidx'
import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'

import InputField from 'pages/common/forms/input/InputField'
import Button from 'pages/common/components/button/Button'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {computeNodesPositions} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {useVisualBuilderGraphReducer} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import PageHeader from 'pages/common/components/PageHeader'
import {transformVisualBuilderGraphIntoWfConfiguration} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {useListActionsApps} from 'models/workflows/queries'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import useApps from './hooks/useApps'
import useCreateActionTemplate from './hooks/useCreateActionTemplate'
import WorkflowVisualBuilder from './components/visualBuilder/WorkflowVisualBuilder'
import {ActionTemplate, ActionTemplateApp} from './types'
import ActionsPlatformTemplateAppSelectBox from './components/ActionsPlatformTemplateAppSelectBox'
import useValidateVisualBuilderGraph from './hooks/useValidateVisualBuilderGraph'

import css from './ActionsPlatformEditTemplateView.less'

const getInitialTemplate = () => {
    const httpStepId = ulid()
    const httpStepVariableId = ulid()

    const b = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: '',
        initialStep: {
            id: httpStepId,
            kind: 'http-request',
            settings: {
                url: '',
                method: 'GET',
                headers: {},
                name: '',
                variables: [
                    {
                        id: httpStepVariableId,
                        name: 'Request result',
                        jsonpath: '$',
                        data_type: null,
                    },
                ],
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
                    outputs: [
                        {
                            description: '',
                            id: httpStepId,
                            path: `steps_state.${httpStepId}.content.${httpStepVariableId}`,
                        },
                    ],
                },
            },
        ],
    })
    b.insertHttpRequestConditionAndEndStepAndSelect('success')
    b.selectParentStep()
    b.insertHttpRequestConditionAndEndStepAndSelect('error')

    return b.build()
}

const ActionsPlatformCreateTemplateView = () => {
    const {isLoading: isEditActionTemplateLoading, createActionTemplate} =
        useCreateActionTemplate()
    const {
        data: actionsApps = [],
        isInitialLoading: isActionsAppsInitialLoading,
    } = useListActionsApps()
    const {apps = [], isLoading: isAppsLoading} = useApps()

    const history = useHistory()
    const template = useMemo(() => getInitialTemplate(), [])
    const [templateApp, setTemplateApp] = useState<ActionTemplateApp>()

    const [shouldShowErrors, setShouldShowErrors] = useState(false)
    const [visualBuilderGraphDirty, dispatch] = useVisualBuilderGraphReducer(
        computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph(template)
        )
    )
    const appDispatch = useAppDispatch()

    const handleValidate = useValidateVisualBuilderGraph()
    const handleSave = useCallback(
        async (isDraft: boolean) => {
            const error = handleValidate(visualBuilderGraphDirty)

            if (error) {
                setShouldShowErrors(true)

                void appDispatch(
                    notify({
                        message: error,
                        allowHTML: true,
                        showDismissButton: true,
                        status: NotificationStatus.Error,
                    })
                )

                return
            }

            await createActionTemplate([
                {
                    internal_id:
                        visualBuilderGraphDirty.wfConfigurationOriginal
                            .internal_id,
                },
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    isDraft
                ) as ActionTemplate,
            ])

            history.push(
                `/app/automation/actions-platform/edit/${visualBuilderGraphDirty.wfConfigurationOriginal.id}`
            )
        },
        [
            visualBuilderGraphDirty,
            createActionTemplate,
            handleValidate,
            appDispatch,
            history,
        ]
    )

    const selectableApps = useMemo(() => {
        const actionsAppsByAppId = _keyBy(actionsApps, 'id')

        return apps.filter(
            (app) => app.type !== 'app' || app.id in actionsAppsByAppId
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
                        caption="Provide a name for this Action template."
                        value={visualBuilderGraphDirty.name}
                        onChange={(nextValue) => {
                            dispatch({
                                type: 'SET_NAME',
                                name: nextValue,
                            })
                        }}
                        hasError={
                            shouldShowErrors &&
                            !visualBuilderGraphDirty.name.trim()
                        }
                    />
                }
            >
                <div className={css.actions}>
                    <Button
                        intent="secondary"
                        onClick={() => {
                            history.push('/app/automation/actions-platform')
                        }}
                        isDisabled={
                            isEditActionTemplateLoading ||
                            isActionsAppsInitialLoading ||
                            isAppsLoading
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="secondary"
                        isDisabled={
                            isEditActionTemplateLoading ||
                            isActionsAppsInitialLoading ||
                            isAppsLoading
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
                            isEditActionTemplateLoading ||
                            isActionsAppsInitialLoading ||
                            isAppsLoading
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
                <WorkflowVisualBuilder
                    visualBuilderGraph={visualBuilderGraphDirty}
                    dispatch={dispatch}
                    shouldShowErrors={shouldShowErrors}
                />
                <Modal
                    isOpen={!visualBuilderGraphDirty.apps?.length}
                    isClosable={false}
                    onClose={_noop}
                >
                    <ModalHeader title="Select an App" />
                    <ModalBody>
                        <ActionsPlatformTemplateAppSelectBox
                            apps={selectableApps}
                            value={templateApp}
                            onChange={setTemplateApp}
                            isDisabled={
                                isActionsAppsInitialLoading || isAppsLoading
                            }
                        />
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button
                            onClick={() => {
                                dispatch({
                                    type: 'SET_APP',
                                    app: templateApp!,
                                })
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

export default ActionsPlatformCreateTemplateView
