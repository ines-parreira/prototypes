import React, {useCallback, useMemo, useState} from 'react'
import {Container} from 'reactstrap'

import InputField from 'pages/common/forms/input/InputField'
import Button from 'pages/common/components/button/Button'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {computeNodesPositions} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {useVisualBuilderGraphReducer} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import PageHeader from 'pages/common/components/PageHeader'
import {
    areGraphsEqual,
    transformVisualBuilderGraphIntoWfConfiguration,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {DraftBadge} from 'pages/automate/workflows/components/DraftBadge'

import {ActionTemplate} from './types'
import WorkflowVisualBuilder from './components/visualBuilder/WorkflowVisualBuilder'
import useEditActionTemplate from './hooks/useEditActionTemplate'
import useValidateVisualBuilderGraph from './hooks/useValidateVisualBuilderGraph'

import css from './ActionsPlatformEditTemplateView.less'

type Props = {
    template: ActionTemplate
}

const ActionsPlatformEditTemplateView = ({template}: Props) => {
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
        (isDraft: boolean) => {
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

            void editActionTemplate([
                {internal_id: template.internal_id},
                transformVisualBuilderGraphIntoWfConfiguration(
                    visualBuilderGraphDirty,
                    isDraft
                ) as ActionTemplate,
            ])
        },
        [
            visualBuilderGraphDirty,
            editActionTemplate,
            template.internal_id,
            appDispatch,
            handleValidate,
        ]
    )

    return (
        <div className={css.page}>
            <PageHeader
                className={css.header}
                title={
                    <div className={css.title}>
                        <InputField
                            className={css.name}
                            placeholder="e.g. Update shipping address"
                            caption="Provide a name for this Action template."
                            darkenCaption
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
                        {template.is_draft && <DraftBadge />}
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
                    <Button
                        intent={template.is_draft ? 'secondary' : 'primary'}
                        isDisabled={
                            !isVisualBuilderGraphDirty ||
                            isEditActionTemplateLoading
                        }
                        onClick={() => {
                            handleSave(template.is_draft)
                        }}
                    >
                        Save
                    </Button>
                    {template.is_draft && (
                        <Button
                            intent="primary"
                            isDisabled={isEditActionTemplateLoading}
                            onClick={() => {
                                handleSave(false)
                            }}
                        >
                            Publish
                        </Button>
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

export default ActionsPlatformEditTemplateView
