import React, {useCallback, useMemo, useState} from 'react'
import {Container} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import {DraftBadge} from 'pages/automate/workflows/components/DraftBadge'
import {useVisualBuilderGraphReducer} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {computeNodesPositions} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from 'pages/automate/workflows/models/workflowConfiguration.model'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import InputField from 'pages/common/forms/input/InputField'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from './ActionsPlatformEditTemplateView.less'
import WorkflowVisualBuilder from './components/visualBuilder/WorkflowVisualBuilder'
import useEditActionTemplate from './hooks/useEditActionTemplate'
import useValidateVisualBuilderGraph from './hooks/useValidateVisualBuilderGraph'
import {ActionTemplate} from './types'

type Props = {
    template: ActionTemplate
}

const ActionsPlatformEditStepView = ({template}: Props) => {
    const {isLoading: isEditActionTemplateLoading, editActionTemplate} =
        useEditActionTemplate()

    const visualBuilderGraph = useMemo(
        () =>
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph(template)
            ),
        [template]
    )
    const [shouldShowErrors, setShouldShowErrors] = useState(false)
    const [visualBuilderGraphDirty, dispatch] =
        useVisualBuilderGraphReducer(visualBuilderGraph)

    const isVisualBuilderGraphDirty = useMemo(
        () => !areGraphsEqual(visualBuilderGraph, visualBuilderGraphDirty),
        [visualBuilderGraph, visualBuilderGraphDirty]
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

            const configurationDirty =
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    isDraft
                ) as ActionTemplate

            await editActionTemplate([
                {
                    internal_id:
                        visualBuilderGraphDirty.wfConfigurationOriginal
                            .internal_id,
                },
                configurationDirty,
            ])

            dispatch({
                type: 'RESET_GRAPH',
                graph: computeNodesPositions(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(
                        configurationDirty
                    )
                ),
            })
        },
        [
            visualBuilderGraphDirty,
            editActionTemplate,
            appDispatch,
            handleValidate,
            dispatch,
        ]
    )

    const isDraft = visualBuilderGraphDirty.wfConfigurationOriginal.is_draft

    return (
        <div className={css.page}>
            <PageHeader
                className={css.header}
                title={
                    <div className={css.title}>
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
                            isDisabled={!isDraft}
                        />
                        {isDraft && <DraftBadge />}
                    </div>
                }
            >
                <div className={css.actions}>
                    <Button
                        intent="secondary"
                        onClick={() => {
                            dispatch({
                                type: 'RESET_GRAPH',
                                graph: visualBuilderGraph,
                            })
                        }}
                        isDisabled={
                            !isVisualBuilderGraphDirty ||
                            isEditActionTemplateLoading
                        }
                    >
                        Discard changes
                    </Button>
                    {isDraft ? (
                        <>
                            <Button
                                intent="secondary"
                                isDisabled={
                                    !isVisualBuilderGraphDirty ||
                                    isEditActionTemplateLoading
                                }
                                onClick={() => {
                                    void handleSave(true)
                                }}
                            >
                                Save
                            </Button>
                            <ConfirmationPopover
                                onConfirm={() => {
                                    void handleSave(false)
                                }}
                                showCancelButton
                                cancelButtonProps={{intent: 'secondary'}}
                                content="Are you sure you want to publish this Action step? This will prevent you from updating settings like name, conditions and deleting already existing inputs."
                            >
                                {({uid, onDisplayConfirmation}) => (
                                    <Button
                                        id={uid}
                                        intent="primary"
                                        isDisabled={isEditActionTemplateLoading}
                                        onClick={onDisplayConfirmation}
                                    >
                                        Publish
                                    </Button>
                                )}
                            </ConfirmationPopover>
                        </>
                    ) : (
                        <ConfirmationPopover
                            onConfirm={() => {
                                void handleSave(false)
                            }}
                            showCancelButton
                            cancelButtonProps={{intent: 'secondary'}}
                            content="Are you sure you want to update this Action step? This will also update all Actions using this step."
                        >
                            {({uid, onDisplayConfirmation}) => (
                                <Button
                                    id={uid}
                                    intent="primary"
                                    isDisabled={
                                        !isVisualBuilderGraphDirty ||
                                        isEditActionTemplateLoading
                                    }
                                    onClick={onDisplayConfirmation}
                                >
                                    Save
                                </Button>
                            )}
                        </ConfirmationPopover>
                    )}
                </div>
            </PageHeader>
            <Container className={css.container} fluid>
                <WorkflowVisualBuilder
                    visualBuilderGraph={visualBuilderGraphDirty}
                    dispatch={dispatch}
                    shouldShowErrors={shouldShowErrors}
                />
            </Container>
        </div>
    )
}

export default ActionsPlatformEditStepView
