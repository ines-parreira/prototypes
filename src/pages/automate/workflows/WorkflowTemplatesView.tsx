import React from 'react'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {Link} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'

import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'

import {FLOWS} from '../common/components/constants'
import WorkflowTemplateCard from './components/WorkflowTemplateCard'
import {WORKFLOW_TEMPLATES_LIST} from './workflowTemplates'

import css from './WorkflowTemplatesView.less'
import WorkflowCustomFlowCard from './components/WorkflowCustomFlowCard'

type Props = {
    goToNewWorkflowPage: () => void
    goToNewWorkflowFromTemplatePage: (templateSlug: string) => void
    workflowsUrl: string
}

const WorkflowTemplatesView = ({
    goToNewWorkflowPage,
    goToNewWorkflowFromTemplatePage,
    workflowsUrl,
}: Props) => {
    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={workflowsUrl}>{FLOWS}</Link>
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
                    <Link to={workflowsUrl} className="d-flex">
                        <img src={ArrowBackwardIcon} alt="Back" />
                        Back To Flows
                    </Link>
                </div>

                <h1 className={css.title}>Flow templates</h1>

                <div className={css.description}>
                    Start with a Flow template that you can customize to fit
                    your needs:
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
