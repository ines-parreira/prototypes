import React from 'react'
import {Container} from 'reactstrap'
import {Link, NavLink, Route, Switch, useRouteMatch} from 'react-router-dom'
import _memoize from 'lodash/memoize'
import {useFlags} from 'launchdarkly-react-client-sdk'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Alert from 'pages/common/components/Alert/Alert'
import useEffectOnce from 'hooks/useEffectOnce'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import {AGENT_ROLE} from 'config/user'
import {FLOWS, QUICK_RESPONSES} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import QuickResponsesViewContainer from '../quickResponses/QuickResponsesViewContainer'
import WorkflowsEmptyState from './components/WorkflowsEmptyState'
import WorkflowsList from './components/WorkflowsList'

import css from './WorkflowsView.less'
import useStoreWorkflows from './hooks/useStoreWorkflows'
import {useStoreWorkflowsApi} from './hooks/useStoreWorkflowsApi'
import WorkflowTemplatesViewContainer from './WorkflowTemplatesViewContainer'

type WorkflowsViewProps = {
    shopType: string
    shopName: string
    goToNewWorkflowPage: () => void
    goToWorkflowTemplatesPage: () => void
    goToEditWorkflowPage: (workflowId: string) => void
    goToNewWorkflowFromTemplatePage: (templateSlug: string) => void
    connectedChannelsUrl: string
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
}

const memoizedWithUserRoleRequired = _memoize(withUserRoleRequired)

export default function WorkflowsView({
    shopName,
    shopType,
    goToNewWorkflowPage,
    goToWorkflowTemplatesPage,
    goToEditWorkflowPage,
    goToNewWorkflowFromTemplatePage,
    notifyMerchant,
    connectedChannelsUrl,
}: WorkflowsViewProps) {
    useHistoryTracking(SegmentEvent.AutomateFlowsVisited)

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

    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Workflows',
        })
    })

    const workflowsElement =
        isFetchPending || !storeIntegrationId ? (
            <Loader data-testid="loader" />
        ) : hasStoreWorkflows ? (
            <Container fluid className={css.pageContainer}>
                <div className={css.pageContainerHeadline}>
                    <div className={css.descriptionContainer}>
                        <div className={css.description}>
                            <div className={css.descriptionText}>
                                Create and edit Flows to automate multi-step
                                interactions in Chat, Help Center, and Contact
                                Form.
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
                            <Alert icon className={css.alert}>
                                Control where customers see Flows in{' '}
                                <Link
                                    to={{
                                        pathname: connectedChannelsUrl,
                                        state: {
                                            from: 'workflow-alert',
                                        },
                                    }}
                                >
                                    channels
                                </Link>
                                .
                            </Alert>
                        </div>
                        {isImprovedNavigationEnabled && (
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
                        )}
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
                goToNewWorkflowPage={goToNewWorkflowPage}
                goToWorkflowTemplatesPage={goToWorkflowTemplatesPage}
                goToNewWorkflowFromTemplatePage={
                    goToNewWorkflowFromTemplatePage
                }
            />
        )

    const baseUrl = `/app/automation/${shopType}/${shopName}/flows`

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                {isImprovedNavigationEnabled ? (
                    <PageHeader title={FLOWS} />
                ) : (
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
                )}
            </div>

            {isImprovedNavigationEnabled && (
                <SecondaryNavbar>
                    <NavLink
                        to={baseUrl}
                        isActive={(match, location) => {
                            if (!match) {
                                return false
                            }

                            return [baseUrl, `${baseUrl}/templates`].includes(
                                location.pathname
                            )
                        }}
                    >
                        {FLOWS}
                    </NavLink>

                    <NavLink to={`${baseUrl}/quick-responses`} exact>
                        {QUICK_RESPONSES}
                    </NavLink>
                </SecondaryNavbar>
            )}

            {isImprovedNavigationEnabled ? (
                <Switch>
                    <Route path={path} exact>
                        {workflowsElement}
                    </Route>
                    <Route
                        path={`${path}/quick-responses`}
                        exact
                        component={memoizedWithUserRoleRequired(
                            QuickResponsesViewContainer,
                            AGENT_ROLE
                        )}
                    />
                    <Route
                        path={`${path}/templates`}
                        exact
                        component={memoizedWithUserRoleRequired(
                            WorkflowTemplatesViewContainer,
                            AGENT_ROLE
                        )}
                    />
                </Switch>
            ) : (
                workflowsElement
            )}
        </div>
    )
}
