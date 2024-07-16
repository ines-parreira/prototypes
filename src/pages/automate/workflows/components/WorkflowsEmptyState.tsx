import React from 'react'

import {Container} from 'reactstrap'

import Button from 'pages/common/components/button/Button'

import templatesImage from 'assets/img/workflows/templates.png'

import AutomateViewEmptyStateBanner from 'pages/automate/common/components/AutomateViewEmptyStateBanner'
import {WORKFLOW_TEMPLATES_LIST} from '../workflowTemplates'

import templatesCss from '../WorkflowTemplatesView.less'
import {WORKFLOWS_DESCRIPTION, WORKFLOWS_MAIN_TITLE} from '../common/constants'
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
        <>
            <AutomateViewEmptyStateBanner
                id="flows"
                title={WORKFLOWS_MAIN_TITLE}
                description={WORKFLOWS_DESCRIPTION}
                image={templatesImage}
            />
            <Container fluid className={css.pageContainer}>
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
                                    <i className="material-icons">
                                        arrow_forward
                                    </i>
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    )
}

export default WorkflowsEmptyState
