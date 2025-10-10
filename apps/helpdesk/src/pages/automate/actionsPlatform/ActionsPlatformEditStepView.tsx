import React, { useCallback, useMemo } from 'react'

import { Container } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { DraftBadge } from 'pages/automate/workflows/components/DraftBadge'
import {
    useVisualBuilder,
    VisualBuilderContext,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { useVisualBuilderGraphReducer } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { transformWorkflowConfigurationIntoVisualBuilderGraph } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { mapServerErrorsToGraph } from 'pages/automate/workflows/utils/serverValidationErrors'
import PageHeader from 'pages/common/components/PageHeader'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import InputField from 'pages/common/forms/input/InputField'

import WorkflowVisualBuilder from './components/visualBuilder/WorkflowVisualBuilder'
import useEditActionTemplate from './hooks/useEditActionTemplate'
import useTouchActionStepGraph from './hooks/useTouchActionStepGraph'
import useValidateActionStepGraph from './hooks/useValidateActionStepGraph'
import useValidateOnVisualBuilderGraphChange from './hooks/useValidateOnVisualBuilderGraphChange'
import { ActionTemplate } from './types'

import css from './ActionsPlatformEditStepView.less'

type Props = {
    template: ActionTemplate
}

const ActionsPlatformEditStepView = ({ template }: Props) => {
    const { isLoading: isEditActionTemplateLoading, editActionTemplate } =
        useEditActionTemplate()

    const visualBuilderGraph = useMemo(
        () =>
            computeNodesPositions(
                transformWorkflowConfigurationIntoVisualBuilderGraph(
                    template,
                    true,
                ),
            ),
        [template],
    )
    const [visualBuilderGraphDirty, dispatch] =
        useVisualBuilderGraphReducer(visualBuilderGraph)

    const isVisualBuilderGraphDirty = useMemo(
        () => !areGraphsEqual(visualBuilderGraph, visualBuilderGraphDirty),
        [visualBuilderGraph, visualBuilderGraphDirty],
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

            const configurationDirty =
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    isDraft,
                    [],
                ) as ActionTemplate

            try {
                await editActionTemplate([
                    {
                        internal_id: visualBuilderGraphDirty.internal_id,
                    },
                    configurationDirty,
                ])

                dispatch({
                    type: 'RESET_GRAPH',
                    graph: computeNodesPositions(
                        transformWorkflowConfigurationIntoVisualBuilderGraph(
                            configurationDirty,
                            true,
                        ),
                    ),
                })
            } catch (error) {
                // Check if this is a server validation error we can parse
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
                }

                // Re-throw for any other error handling
                throw error
            }
        },
        [
            visualBuilderGraphDirty,
            editActionTemplate,
            handleValidate,
            handleTouch,
            dispatch,
        ],
    )

    const isDraft = visualBuilderGraphDirty.is_draft

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
                            error={visualBuilderGraphDirty.errors?.name}
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
                                cancelButtonProps={{ intent: 'secondary' }}
                                content="Are you sure you want to publish this Action step? This will prevent you from updating settings like name, conditions and deleting already existing inputs."
                            >
                                {({ uid, onDisplayConfirmation }) => (
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
                            cancelButtonProps={{ intent: 'secondary' }}
                            content="Are you sure you want to update this Action step? This will also update all Actions using this step."
                        >
                            {({ uid, onDisplayConfirmation }) => (
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
                <VisualBuilderContext.Provider
                    value={visualBuilderContextValue}
                >
                    <WorkflowVisualBuilder />
                </VisualBuilderContext.Provider>
            </Container>
        </div>
    )
}

export default ActionsPlatformEditStepView
