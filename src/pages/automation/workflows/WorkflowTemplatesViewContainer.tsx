import React, {useCallback} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {ErrorBoundary} from 'pages/ErrorBoundary'

import WorkflowTemplatesView from './WorkflowTemplatesView'

const WorkflowTemplatesViewContainer = () => {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const history = useHistory()
    const workflowsUrl = `/app/automation/${shopType}/${shopName}/flows`
    const newWorkflowUrl = `${workflowsUrl}/new`

    const goToNewWorkflowPage = useCallback(() => {
        history.push(newWorkflowUrl)
    }, [history, newWorkflowUrl])
    const goToNewWorkflowFromTemplatePage = useCallback(
        (templateSlug: string) => {
            history.push(`${newWorkflowUrl}?template=${templateSlug}`)
        },
        [history, newWorkflowUrl]
    )

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation" />
    }

    return (
        <ErrorBoundary sentryTags={{section: 'workflows'}}>
            <WorkflowTemplatesView
                goToNewWorkflowPage={goToNewWorkflowPage}
                goToNewWorkflowFromTemplatePage={
                    goToNewWorkflowFromTemplatePage
                }
                workflowsUrl={workflowsUrl}
            />
        </ErrorBoundary>
    )
}

export default WorkflowTemplatesViewContainer
