import React from 'react'

import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap'

import { Button } from '@gorgias/merchant-ui-kit'

import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'
import PageHeader from 'pages/common/components/PageHeader'

import { FLOWS } from '../common/components/constants'
import WorkflowCustomFlowCard from './components/WorkflowCustomFlowCard'
import WorkflowTemplateCard from './components/WorkflowTemplateCard'
import { WORKFLOW_TEMPLATES_LIST } from './workflowTemplates'

import css from './WorkflowTemplatesView.less'

type Props = {
    goToNewWorkflowPage: () => void
    goToNewWorkflowFromTemplatePage: (templateSlug: string) => void
    workflowsURL: string
}

const WorkflowTemplatesView = ({
    goToNewWorkflowPage,
    goToNewWorkflowFromTemplatePage,
    workflowsURL,
}: Props) => {
    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={workflowsURL}>{FLOWS}</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Flow Templates
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <Button onClick={goToNewWorkflowPage} intent="secondary">
                        Create Custom Flow
                    </Button>
                </PageHeader>
            </div>
            <Container fluid className={css.container}>
                <div className={css.backWrapper}>
                    <Link to={workflowsURL} className="d-flex">
                        <img src={ArrowBackwardIcon} alt="Back" />
                        Back To Flows
                    </Link>
                </div>

                <div className={css.descriptionContainer}>
                    <div className={css.heading}>
                        Choose a template and customize it to fit your needs
                    </div>
                </div>

                <div className={css.templatesContainer}>
                    {WORKFLOW_TEMPLATES_LIST.map((template) => (
                        <WorkflowTemplateCard
                            key={template.slug}
                            template={template}
                            goToNewWorkflowFromTemplatePage={
                                goToNewWorkflowFromTemplatePage
                            }
                        />
                    ))}
                    <WorkflowCustomFlowCard
                        goToNewWorkflowPage={goToNewWorkflowPage}
                    />
                </div>
            </Container>
        </div>
    )
}

export default WorkflowTemplatesView
