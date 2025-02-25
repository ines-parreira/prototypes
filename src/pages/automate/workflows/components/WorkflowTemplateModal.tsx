import React from 'react'

import { ChannelTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { transformWorkflowConfigurationIntoVisualBuilderGraph } from 'pages/automate/workflows/models/workflowConfiguration.model'
import { WorkflowTemplate } from 'pages/automate/workflows/models/workflowConfiguration.types'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import VisualBuilderTemplatePreview from '../editor/visualBuilder/components/VisualBuilderTemplatePreview'
import { computeNodesPositions } from '../hooks/useVisualBuilderGraphReducer/utils'

import css from './WorkflowTemplateModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    goToNewWorkflowPage: () => void
    template: WorkflowTemplate
}

export const WorkflowTemplateModal = ({
    isOpen,
    onClose,
    goToNewWorkflowPage,
    template,
}: Props) => {
    const workflow = template.getConfiguration('template', 0)
    const visualBuilderGraph = computeNodesPositions(
        transformWorkflowConfigurationIntoVisualBuilderGraph<ChannelTriggerNodeType>(
            workflow,
        ),
    )
    return (
        <Modal isOpen={isOpen} onClose={onClose} classNameDialog={css.dialog}>
            <ModalHeader title={template.name} />
            <ModalBody className={css.modalBody}>
                {isOpen && (
                    <VisualBuilderTemplatePreview
                        visualBuilderGraph={visualBuilderGraph}
                    />
                )}
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={goToNewWorkflowPage}>Use template</Button>
            </ModalActionsFooter>
        </Modal>
    )
}
