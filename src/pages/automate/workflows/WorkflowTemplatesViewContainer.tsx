import React, { useCallback, useMemo } from 'react'

import { Redirect, useHistory, useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { getHasAutomate } from 'state/billing/selectors'

import WorkflowTemplatesView from './WorkflowTemplatesView'

const WorkflowTemplatesViewContainer = () => {
    const { shopName, shopType } = useParams<{
        shopType: string
        shopName: string
    }>()

    const isAutomateSettings = useIsAutomateSettings()

    const history = useHistory()
    const workflowsURL = useMemo(
        () =>
            isAutomateSettings
                ? `/app/settings/flows/${shopType}/${shopName}`
                : `/app/automation/${shopType}/${shopName}/flows`,
        [isAutomateSettings, shopName, shopType],
    )
    const newWorkflowURL = `${workflowsURL}/new`

    const goToNewWorkflowPage = useCallback(() => {
        history.push(`${newWorkflowURL}?from=templates`)
    }, [history, newWorkflowURL])
    const goToNewWorkflowFromTemplatePage = useCallback(
        (templateSlug: string) => {
            history.push(
                `${newWorkflowURL}?template=${templateSlug}&from=templates`,
            )
        },
        [history, newWorkflowURL],
    )

    const hasAutomate = useAppSelector(getHasAutomate)

    const redirectURL = useAutomateBaseURL()

    if (!hasAutomate) {
        return <Redirect to={redirectURL} />
    }

    return (
        <ErrorBoundary sentryTags={{ section: 'workflows' }}>
            <WorkflowTemplatesView
                goToNewWorkflowPage={goToNewWorkflowPage}
                goToNewWorkflowFromTemplatePage={
                    goToNewWorkflowFromTemplatePage
                }
                workflowsURL={workflowsURL}
            />
        </ErrorBoundary>
    )
}

export default WorkflowTemplatesViewContainer
