import React from 'react'

import {Container} from 'reactstrap'

import Button from 'pages/common/components/button/Button'

import templatesImage from 'assets/img/workflows/templates.png'

import {WORKFLOW_TEMPLATES_LIST} from '../workflowTemplates'

import templatesCss from '../WorkflowTemplatesView.less'
import css from './WorkflowsEmptyState.less'
import WorkflowTemplateCard from './WorkflowTemplateCard'

type Props = {
    goToNewWorkflowPage: () => void
    goToWorkflowTemplatesPage: () => void
    goToNewWorkflowFromTemplatePage: (templateSlug: string) => void
}

const WorkflowsEmptyState: React.FC<Props> = ({
    goToNewWorkflowPage,
    goToWorkflowTemplatesPage,
    goToNewWorkflowFromTemplatePage,
}) => {
    return (
        <Container fluid className={css.pageContainer}>
            <div className={css.pageHeaderContainer}>
                <div className={css.pageHeader}>
                    <div className={css.pageIntro}>
                        <h1 className={css.pageTitle}>
                            Create Flows to automate customer interactions on
                            Chat, Help Center and Contact Form
                        </h1>
                        <p className={css.pageDescription}>
                            Build single or multi-step Flows to answer
                            questions, recommend products, help customers
                            troubleshoot, and more.
                        </p>
                        <div className={css.links}>
                            <a
                                href="https://link.gorgias.com/pnl"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <i className="material-icons mr-2">
                                    ondemand_video
                                </i>
                                Join our Flows Masterclass live webinar
                            </a>
                            <a
                                href="https://docs.gorgias.com/en-US/flows-101-252069"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <i className="material-icons mr-2">menu_book</i>
                                Learn more about Flows
                            </a>
                            <a
                                href="https://link.gorgias.com/z1e"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <i className="material-icons mr-2">menu_book</i>
                                10 Flows use cases and best practices
                            </a>
                        </div>
                    </div>
                    <div className={css.templatesImageContainer}>
                        <img
                            className={css.templatesImage}
                            src={templatesImage}
                            alt="Flows Templates"
                        />
                    </div>
                </div>
            </div>
            <div className={css.pageContent}>
                <div className={css.pageTitleContainer}>
                    <p className={css.pageTitle}>
                        Choose a template and customize it to fit your needs
                    </p>
                    <div className={css.pageTitleActions}>
                        <Button
                            onClick={goToNewWorkflowPage}
                            intent="secondary"
                        >
                            Create Custom Flow
                        </Button>
                        <Button onClick={goToWorkflowTemplatesPage}>
                            Create From Template
                        </Button>
                    </div>
                </div>
                <div className={templatesCss.templatesContainer}>
                    {WORKFLOW_TEMPLATES_LIST.slice(0, 2).map((template) => (
                        <WorkflowTemplateCard
                            key={template.slug}
                            template={template}
                            goToNewWorkflowFromTemplatePage={
                                goToNewWorkflowFromTemplatePage
                            }
                        />
                    ))}
                    <div className={css.seeAllTemplates}>
                        <Button
                            intent="secondary"
                            size="medium"
                            fillStyle="ghost"
                            onClick={goToWorkflowTemplatesPage}
                        >
                            <span>See All Templates</span>
                            <span className={css.arrowIcon}>
                                <i className="material-icons">arrow_forward</i>
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default WorkflowsEmptyState
