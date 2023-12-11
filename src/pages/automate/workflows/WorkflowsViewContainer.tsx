import React, {useCallback} from 'react'
import {useHistory, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {ErrorBoundary} from 'pages/ErrorBoundary'

import AutomatePaywallView from '../common/components/AutomatePaywallView'
import {AutomateFeatures} from '../common/types'
import WorkflowsView from './WorkflowsView'

export default function WorkflowsViewContainer() {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const history = useHistory()
    const dispatch = useAppDispatch()

    const newWorkflowUrl = `${history.location.pathname}/new`

    const goToNewWorkflowPage = useCallback(() => {
        history.push(newWorkflowUrl)
    }, [history, newWorkflowUrl])

    const goToNewWorkflowFromTemplatePage = useCallback(
        (templateSlug: string) => {
            history.push(`${newWorkflowUrl}?template=${templateSlug}`)
        },
        [history, newWorkflowUrl]
    )

    const goToWorkflowTemplatesPage = useCallback(() => {
        history.push(`${history.location.pathname}/templates`)
    }, [history])

    const goToEditWorkflowPage = useCallback(
        (workflowId: string) => {
            history.push(`${history.location.pathname}/edit/${workflowId}`)
        },
        [history]
    )

    const notifyMerchant = useCallback(
        (message: string, kind: 'success' | 'error') => {
            void dispatch(
                notify({
                    message,
                    allowHTML: true,
                    showDismissButton: true,
                    status:
                        kind === 'success'
                            ? NotificationStatus.Success
                            : NotificationStatus.Error,
                })
            )
        },
        [dispatch]
    )

    const quickResponsesUrl = `/app/automation/${shopType}/${shopName}/quick-responses`
    const connectedChannelsUrl = `/app/automation/${shopType}/${shopName}/connected-channels`

    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return (
        <ErrorBoundary sentryTags={{section: 'workflows'}}>
            <WorkflowsView
                shopName={shopName}
                shopType={shopType}
                goToNewWorkflowPage={goToNewWorkflowPage}
                goToWorkflowTemplatesPage={goToWorkflowTemplatesPage}
                goToEditWorkflowPage={goToEditWorkflowPage}
                goToNewWorkflowFromTemplatePage={
                    goToNewWorkflowFromTemplatePage
                }
                quickResponsesUrl={quickResponsesUrl}
                connectedChannelsUrl={connectedChannelsUrl}
                notifyMerchant={notifyMerchant}
            />
        </ErrorBoundary>
    )
}
