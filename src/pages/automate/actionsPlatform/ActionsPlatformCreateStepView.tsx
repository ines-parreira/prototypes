import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'
import React, {useCallback, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {Container} from 'reactstrap'
import {ulid} from 'ulidx'

import useAppDispatch from 'hooks/useAppDispatch'
import {useVisualBuilderGraphReducer} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {computeNodesPositions} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {transformVisualBuilderGraphIntoWfConfiguration} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import PageHeader from 'pages/common/components/PageHeader'
import InputField from 'pages/common/forms/input/InputField'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from './ActionsPlatformEditTemplateView.less'
import ActionsPlatformStepAppSelectBox from './components/ActionsPlatformStepAppSelectBox'
import WorkflowVisualBuilder from './components/visualBuilder/WorkflowVisualBuilder'
import useApps from './hooks/useApps'
import useCreateActionTemplate from './hooks/useCreateActionTemplate'
import useValidateVisualBuilderGraph from './hooks/useValidateVisualBuilderGraph'
import {ActionTemplate, ActionTemplateApp} from './types'

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
    })
    b.insertHttpRequestConditionAndEndStepAndSelect('success', {success: true})
    b.selectParentStep()
    b.insertHttpRequestConditionAndEndStepAndSelect('error', {success: false})

    return b.build()
}

const ActionsPlatformCreateStepView = () => {
    const {isLoading: isCreateActionTemplateLoading, createActionTemplate} =
        useCreateActionTemplate()
    const {apps = [], isLoading: isAppsLoading, actionsApps} = useApps()

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
                `/app/automation/actions-platform/steps/edit/${visualBuilderGraphDirty.wfConfigurationOriginal.id}`
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
                        caption="Provide a name for this Action step."
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
                            history.push(
                                '/app/automation/actions-platform/steps'
                            )
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
