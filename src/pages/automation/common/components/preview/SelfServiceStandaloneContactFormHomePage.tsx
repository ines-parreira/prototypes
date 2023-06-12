import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import css from './SelfServiceStandaloneContactFormHomePage.less'

import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'

const WorkflowItem = ({label}: {label: string}) => (
    <div className={css.workflowItem}>
        <div className={css.flowLabel}>{label}</div>
        <i className={classnames('material-icons', css.flowChevron)}>
            keyboard_arrow_right
        </i>
    </div>
)

const SelfServiceStandaloneContactFormHomePage = () => {
    const history = useHistory()

    const workflowsEntrypoints = useWorkflowsEntrypoints()

    const isInitialEntry = history.length === 1

    return (
        <div
            className={classnames(css.contactFormContainer, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.contactFormItemsContainer}>
                {workflowsEntrypoints.map((entrypoint) => (
                    <div
                        key={entrypoint.workflow_id}
                        className={css.listGroupItem}
                    >
                        <WorkflowItem label={entrypoint.label} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SelfServiceStandaloneContactFormHomePage
