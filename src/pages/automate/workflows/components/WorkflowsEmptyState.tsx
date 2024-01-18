import React from 'react'
import classNames from 'classnames'

import {Container} from 'reactstrap'

import Button from 'pages/common/components/button/Button'

import templatesImage from 'assets/img/workflows/templates.png'

import {WORKFLOW_TEMPLATES_LIST} from '../workflowTemplates'

import templatesCss from '../WorkflowTemplatesView.less'
import css from './WorkflowsEmptyState.less'
import WorkflowTemplateCard from './WorkflowTemplateCard'
import WorkflowCustomFlowCard from './WorkflowCustomFlowCard'

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
                            Get started with Flows
                        </h1>
                        <p className={css.pageDescription}>
                            Help customers select products, answer support
                            questions, and more with Flows!
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
                        </div>
                    </div>
                    <div>
                        <img
                            className={css.templatesImage}
                            src={templatesImage}
                            alt="Flows Templates"
                        />
                    </div>
                </div>
            </div>
            <div className={css.pageContent}>
                <p className={css.startWithText}>
                    Start with a Flow template that you can customize to fit
                    your needs:
                </p>
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
                <div className={classNames('divider', css.divider)}>or</div>
                <div className={templatesCss.templatesContainer}>
                    <WorkflowCustomFlowCard
                        goToNewWorkflowPage={goToNewWorkflowPage}
                    />
                    <div className={css.templatePlaceholder} />
                    <div className={css.templatePlaceholder} />
                </div>
            </div>
        </Container>
    )
}

export default WorkflowsEmptyState
