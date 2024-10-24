import React, {useCallback} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {getHasAutomate} from 'state/billing/selectors'

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
        history.push(`${newWorkflowUrl}?from=templates`)
    }, [history, newWorkflowUrl])
    const goToNewWorkflowFromTemplatePage = useCallback(
        (templateSlug: string) => {
            history.push(
                `${newWorkflowUrl}?template=${templateSlug}&from=templates`
            )
        },
        [history, newWorkflowUrl]
    )

    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
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
