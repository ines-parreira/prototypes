import React from 'react'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {Link} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'

import CreateCustomWorkflowFooter from './components/CreateCustomWorkflowFooter'
import WorkflowTemplateCard from './components/WorkflowTemplateCard'
import {WORKFLOW_TEMPLATES_LIST} from './constants'

import css from './WorkflowTemplatesView.less'

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
                                <Link to={workflowsUrl}>Flows</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Flow Templates
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <Button onClick={goToNewWorkflowPage}>
                        Create custom flow
                    </Button>
                </PageHeader>
            </div>
            <Container fluid className={css.container}>
                <div className={css.description}>
                    Start with a flow template that you can customize to fit
                    your needs.
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
                </div>

                <CreateCustomWorkflowFooter
                    goToNewWorkflowPage={goToNewWorkflowPage}
                />
            </Container>
        </div>
    )
}

export default WorkflowTemplatesView
