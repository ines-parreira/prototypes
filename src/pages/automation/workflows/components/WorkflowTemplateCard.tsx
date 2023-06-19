import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'

import {WorkflowTemplate} from '../models/workflowConfiguration.types'
import {WorkflowTemplateModal} from './WorkflowTemplateModal'

import css from './WorkflowTemplateCard.less'

type Props = {
    template: WorkflowTemplate
    goToNewWorkflowFromTemplatePage: (templateSlug: string) => void
}

const WorkflowTemplateCard = ({
    template,
    goToNewWorkflowFromTemplatePage,
}: Props) => {
    const [isModalOpen, setModalOpen] = useState(false)

    const handleClick = () => {
        setModalOpen(true)
    }
    const handleModalClose = () => {
        setModalOpen(false)
    }
    const handleGoToNewWorkflowPage = () => {
        goToNewWorkflowFromTemplatePage(template.slug)
    }

    return (
        <>
            <div className={css.container} onClick={handleClick}>
                <div className={css.header}>
                    <Button size="small" intent="secondary">
                        Preview
                    </Button>
                </div>
                <div>
                    <div className={css.title}>{template.name}</div>
                    <div className={css.description}>
                        {template.description}
                    </div>
                </div>
            </div>
            <WorkflowTemplateModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                goToNewWorkflowPage={handleGoToNewWorkflowPage}
                template={template}
            />
        </>
    )
}

export default WorkflowTemplateCard
