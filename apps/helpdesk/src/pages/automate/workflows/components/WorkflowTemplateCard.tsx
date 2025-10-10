import React, { useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'
import { WorkflowTemplateModal } from './WorkflowTemplateModal'

import css from './WorkflowTemplateCard.less'

const workflowLabelStyles: Record<
    WorkflowTemplateLabelType,
    { color: string; backgroundColor: string }
> = {
    [WorkflowTemplateLabelType.ProductQuestion]: {
        color: 'var(--accessory-blue-3)',
        backgroundColor: 'var(--accessory-blue-1)',
    },
    [WorkflowTemplateLabelType.Policies]: {
        color: 'var(--accessory-orange-3)',
        backgroundColor: 'var(--accessory-orange-1)',
    },
    [WorkflowTemplateLabelType.SubscriptionManagement]: {
        color: 'var(--accessory-magenta-3)',
        backgroundColor: 'var(--accessory-magenta-1)',
    },
    [WorkflowTemplateLabelType.ThirdPartyActions]: {
        color: 'var(--accessory-yellow-3)',
        backgroundColor: 'var(--accessory-yellow-1)',
    },
    [WorkflowTemplateLabelType.PaymentAndDiscounts]: {
        color: 'var(--accessory-teal-3)',
        backgroundColor: 'var(--accessory-teal-1)',
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
