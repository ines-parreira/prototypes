import React from 'react'

import css from './WorkflowCustomFlowCard.less'
import templateCss from './WorkflowTemplateCard.less'

type Props = {
    goToNewWorkflowPage: () => void
}

const WorkflowCustomFlowCard = ({ goToNewWorkflowPage }: Props) => (
    <>
        <div className={css.container} onClick={goToNewWorkflowPage}>
            <div className={css.header}>
                <i className="material-icons">add_circle</i>
            </div>
            <div>
                <div className={templateCss.title}>Custom Flow</div>
                <div className={templateCss.description}>
                    Create a custom Flow from scratch to fit your needs
                </div>
            </div>
        </div>
    </>
)

export default WorkflowCustomFlowCard
