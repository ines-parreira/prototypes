import React from 'react'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'

import {WorkflowTemplate} from '../models/workflowConfiguration.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import VisualBuilderTemplatePreview from '../editor/visualBuilder/components/VisualBuilderTemplatePreview'
import {computeNodesPositions} from '../hooks/useVisualBuilderGraphReducer/utils'

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
        transformWorkflowConfigurationIntoVisualBuilderGraph(workflow)
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
