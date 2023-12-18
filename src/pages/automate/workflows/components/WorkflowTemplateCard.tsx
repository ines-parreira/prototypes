import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'

import {
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'
import {WorkflowTemplateModal} from './WorkflowTemplateModal'

import css from './WorkflowTemplateCard.less'

const workflowLabelStyles: Record<
    WorkflowTemplateLabelType,
    {color: string; backgroundColor: string}
> = {
    [WorkflowTemplateLabelType.ProductQuestion]: {
        color: '#242F8C',
        backgroundColor: '#EAF1FF',
    },
    [WorkflowTemplateLabelType.Policies]: {
        color: '#605708',
        backgroundColor: '#FFFDEA',
    },
    [WorkflowTemplateLabelType.SubscriptionManagement]: {
        color: '#6F0C86',
        backgroundColor: '#FAEAFF',
    },
    [WorkflowTemplateLabelType.ThirdPartyActions]: {
        color: '#605708',
        backgroundColor: '#FFFDEA',
    },
}

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
                    <div
                        className={css.label}
                        style={workflowLabelStyles[template.label]}
                    >
                        {template.label}
                    </div>
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
