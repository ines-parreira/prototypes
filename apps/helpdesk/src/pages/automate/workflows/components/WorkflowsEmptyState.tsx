import { Container } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import templatesImage from 'assets/img/workflows/templates.png'
import AutomateViewEmptyStateBanner from 'pages/automate/common/components/AutomateViewEmptyStateBanner'

import {
    WORKFLOWS_DESCRIPTION,
    WORKFLOWS_MAIN_TITLE,
} from '../common/constants'
import { WORKFLOW_TEMPLATES_LIST } from '../workflowTemplates'
import WorkflowTemplateCard from './WorkflowTemplateCard'

import templatesCss from '../WorkflowTemplatesView.less'
import css from './WorkflowsEmptyState.less'

type Props = {
    goToWorkflowTemplatesPage: () => void
    goToNewWorkflowFromTemplatePage: (templateSlug: string) => void
}

const WorkflowsEmptyState: React.FC<Props> = ({
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
