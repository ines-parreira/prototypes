import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {
    matchPath,
    Redirect,
    Route,
    Switch,
    useRouteMatch,
} from 'react-router-dom'
import {Container} from 'reactstrap'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {AGENT_ROLE} from 'config/user'
import useEffectOnce from 'hooks/useEffectOnce'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'

import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

import {AiAgentMovedBanner} from '../common/components/AiAgentMovedBanner'
import {FLOWS} from '../common/components/constants'
import {useDisplayAiAgentMovedBanner} from '../common/hooks/useDisplayAiAgentMovedBanner'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import {WORKFLOWS_DESCRIPTION} from './common/constants'
import WorkflowsEmptyState from './components/WorkflowsEmptyState'
import WorkflowsList from './components/WorkflowsList'

import useStoreWorkflows from './hooks/useStoreWorkflows'
import {useStoreWorkflowsApi} from './hooks/useStoreWorkflowsApi'
import css from './WorkflowsView.less'
import WorkflowTemplatesViewContainer from './WorkflowTemplatesViewContainer'

type WorkflowsViewProps = {
    shopType: string
    shopName: string
    goToNewWorkflowPage: () => void
    goToWorkflowTemplatesPage: () => void
    goToEditWorkflowPage: (workflowId: string) => void
    goToNewWorkflowFromTemplatePage: (templateSlug: string) => void
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
}

export default function WorkflowsView({
    shopName,
    shopType,
    goToNewWorkflowPage,
    goToWorkflowTemplatesPage,
    goToEditWorkflowPage,
    goToNewWorkflowFromTemplatePage,
    notifyMerchant,
}: WorkflowsViewProps) {
    useHistoryTracking(SegmentEvent.AutomateFlowsVisited)

    const displayAiAgentMovedBanner = useDisplayAiAgentMovedBanner()

    const {path} = useRouteMatch()

    const {
        isUpdatePending,
        duplicateWorkflow,
        removeWorkflowFromStore,
        workflowConfigurationById,
        isFetchPending: isWorkflowsApiFetchPending,
    } = useStoreWorkflowsApi(notifyMerchant)

    const {
        workflows,
        storeIntegrationId,
        isFetchPending: isStoreWorkflowsFetchPending,
    } = useStoreWorkflows({
        shopName,
        shopType,
        notifyMerchant,
        configurationsMap: workflowConfigurationById,
    })

    const hasStoreWorkflows = workflows.length > 0
    const isFetchPending =
        isStoreWorkflowsFetchPending || isWorkflowsApiFetchPending

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Workflows',
        })
    })

    const workflowsElement =
        isFetchPending || !storeIntegrationId ? (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        ) : hasStoreWorkflows ? (
            <Container fluid className={css.pageContainer}>
                <div className={css.pageContainerHeadline}>
                    <div
                        className={classNames(
                            css.descriptionContainer,
                            css.descriptionContainerColumn
                        )}
                    >
                        <div className={css.description}>
                            <div className={css.descriptionText}>
                                {WORKFLOWS_DESCRIPTION}
                            </div>

                            <a
                                href="https://link.gorgias.com/pnl"
                                rel="noopener noreferrer"
                                target="_blank"
                                className={css.descriptionLink}
                            >
                                <i className="material-icons mr-2">
                                    ondemand_video
                                </i>
                                Join our Flows Masterclass live webinar
                            </a>
                            <a
                                href="https://link.gorgias.com/z1e"
                                rel="noopener noreferrer"
                                target="_blank"
                                className={css.descriptionLink}
                            >
                                <i className="material-icons mr-2">menu_book</i>
                                10 Flows use cases and best practices
                            </a>

                            <a
                                href="https://docs.gorgias.com/en-US/create-a-new-flow-256472"
                                rel="noopener noreferrer"
                                target="_blank"
                                className={css.descriptionLink}
                            >
                                <i className="material-icons mr-2">menu_book</i>
                                How to create a Flow
                            </a>
                        </div>
                    </div>
                </div>
                <WorkflowsList
                    storeIntegrationId={storeIntegrationId}
                    notifyMerchant={notifyMerchant}
                    workflows={workflows}
                    onDelete={(workflowId) =>
                        removeWorkflowFromStore(workflowId, storeIntegrationId)
                    }
                    onDuplicate={duplicateWorkflow}
                    goToEditWorkflowPage={goToEditWorkflowPage}
                    isUpdatePending={isUpdatePending}
                />
            </Container>
        ) : (
            <WorkflowsEmptyState
                goToWorkflowTemplatesPage={goToWorkflowTemplatesPage}
                goToNewWorkflowFromTemplatePage={
                    goToNewWorkflowFromTemplatePage
                }
            />
        )

    const baseUrl = `/app/automation/${shopType}/${shopName}/flows`
    const isFlowsTemplatesRoutes = !!matchPath(
        location.pathname,
        '/app/automation/:shopType/:shopName/flows/templates'
    )

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                {!isFlowsTemplatesRoutes && (
                    <>
                        {displayAiAgentMovedBanner && <AiAgentMovedBanner />}
                        <PageHeader title={FLOWS}>
                            <div className={css.headerContainer}>
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
                        </PageHeader>
                    </>
                )}
            </div>

            <Switch>
                <Route path={path} exact>
                    {workflowsElement}
                </Route>
                <Route path={`${path}/quick-responses`} exact>
                    <Redirect to={baseUrl} />
                </Route>

                <Route
                    path={`${path}/templates`}
                    exact
                    component={withUserRoleRequired(
                        WorkflowTemplatesViewContainer,
                        AGENT_ROLE
                    )}
                />
            </Switch>
        </div>
    )
}
