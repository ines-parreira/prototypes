import React, { useCallback, useMemo, useState } from 'react'

import { Prompt } from 'react-router-dom'
import { Container } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import WorkflowVisualBuilder from 'pages/automate/actionsPlatform/components/visualBuilder/WorkflowVisualBuilder'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { areGraphsEqual } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type {
    LLMPromptTriggerNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import IconButton from 'pages/common/components/button/IconButton'
import PageHeader from 'pages/common/components/PageHeader'
import UnsavedChangesModal from 'pages/common/components/UnsavedChangesModal'
import useUnsavedChangesPrompt from 'pages/common/components/useUnsavedChangesPrompt'
import Caption from 'pages/common/forms/Caption/Caption'
import TextInput from 'pages/common/forms/input/TextInput'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './ActionsPlatformTemplateVisualBuilderView.less'

type Props = {
    visualBuilderGraph: VisualBuilderGraph<LLMPromptTriggerNodeType>
    handleValidate: (graph: VisualBuilderGraph) => VisualBuilderGraph
    handleTouch: (graph: VisualBuilderGraph) => VisualBuilderGraph
    onExit: () => void
    onSave: () => void
}

const ActionsPlatformTemplateVisualBuilderView = ({
    visualBuilderGraph,
    handleValidate,
    handleTouch,
    onExit,
    onSave,
}: Props) => {
    const { visualBuilderGraph: visualBuilderGraphDirty, dispatch } =
        useVisualBuilderContext<LLMPromptTriggerNodeType>()

    const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
        useState(false)

    const appDispatch = useAppDispatch()

    const isVisualBuilderGraphDirty = useMemo(
        () => !areGraphsEqual(visualBuilderGraph, visualBuilderGraphDirty),
        [visualBuilderGraph, visualBuilderGraphDirty],
    )

    const handleIsErrored = useCallback((graph: VisualBuilderGraph) => {
        return (
            !!graph.errors?.nodes ||
            graph.apps?.some((app) => !!app.errors) ||
            graph.nodes.some((node) => {
                switch (node.type) {
                    case 'llm_prompt_trigger':
                        return !!node.data.errors?.inputs
                    default:
                        return !!node.data.errors
                }
            })
        )
    }, [])

    const dispatchErrorMessage = useCallback(() => {
        void appDispatch(
            notify({
                status: NotificationStatus.Error,
                message: 'Complete or delete incomplete steps in order to save',
            }),
        )
    }, [appDispatch])

    const dispatchSuccessMessage = useCallback(() => {
        void appDispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'Successfully updated Action',
            }),
        )
    }, [appDispatch])

    const {
        isOpen: isUnsavedChangesPromptOpen,
        onClose: onUnsavedChangesPromptClose,
        onNavigateAway,
    } = useUnsavedChangesPrompt({
        when: isVisualBuilderGraphDirty,
    })

    return (
        <div className={css.page}>
            <PageHeader
                className={css.header}
                title={
                    <div className={css.title}>
                        <TextInput
                            className={css.name}
                            value={
                                visualBuilderGraphDirty.name ||
                                'Untitled Action'
                            }
                            isDisabled
                        />
                        <Caption className={css.caption}>Action name</Caption>
                    </div>
                }
            >
                <div className={css.actions}>
                    <div className={css.buttons}>
                        <Button
                            onClick={() => {
                                if (isVisualBuilderGraphDirty) {
                                    const graph = handleValidate(
                                        handleTouch(visualBuilderGraphDirty),
                                    )
                                    const isErrored = handleIsErrored(graph)

                                    if (isErrored) {
                                        dispatch({
                                            type: 'RESET_GRAPH',
                                            graph,
                                        })

                                        dispatchErrorMessage()

                                        return
                                    }
                                }

                                onSave()
                                dispatchSuccessMessage()
                            }}
                        >
                            Save
                        </Button>
                        <IconButton
                            intent="secondary"
                            onClick={() => {
                                if (isVisualBuilderGraphDirty) {
                                    setIsUnsavedChangesModalOpen(true)
                                } else {
                                    onExit()
                                }
                            }}
                        >
                            close
                        </IconButton>
                    </div>
                    <div className={css.description}>
                        Add at least one step with a 3rd party app or an HTTP
                        request to perform the Action.
                    </div>
                </div>
            </PageHeader>
            <Container className={css.container} fluid>
                <WorkflowVisualBuilder />
            </Container>
            <UnsavedChangesModal
                isOpen={isUnsavedChangesModalOpen || isUnsavedChangesPromptOpen}
                onDiscard={() => {
                    onExit()
                    onUnsavedChangesPromptClose()
                    setIsUnsavedChangesModalOpen(false)

                    dispatch({
                        type: 'RESET_GRAPH',
                        graph: visualBuilderGraph,
                    })
                }}
                onClose={() => {
                    onUnsavedChangesPromptClose()
                    setIsUnsavedChangesModalOpen(false)
                }}
                onSave={() => {
                    const graph = handleValidate(
                        handleTouch(visualBuilderGraphDirty),
                    )
                    const isErrored = handleIsErrored(graph)

                    if (isErrored) {
                        dispatch({
                            type: 'RESET_GRAPH',
                            graph,
                        })

                        setIsUnsavedChangesModalOpen(false)
                        onUnsavedChangesPromptClose()

                        dispatchErrorMessage()

                        return
                    }

                    setIsUnsavedChangesModalOpen(false)
                    onSave()
                    onUnsavedChangesPromptClose()
                    dispatchSuccessMessage()
                }}
            />
            <Prompt when={isVisualBuilderGraphDirty} message={onNavigateAway} />
        </div>
    )
}

export default ActionsPlatformTemplateVisualBuilderView
