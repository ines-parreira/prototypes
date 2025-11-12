import { createElement, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import {
    matchPath,
    Redirect,
    Route,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router-dom'
import { Container } from 'reactstrap'

import { LegacyButton as Button, LoadingSpinner } from '@gorgias/axiom'

import { AGENT_ROLE } from 'config/user'
import { useFlag } from 'core/flags'
import PageHeader from 'pages/common/components/PageHeader'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { FLOWS } from '../common/components/constants'
import { useHistoryTracking } from '../common/hooks/useHistoryTracking'
import { WORKFLOWS_DESCRIPTION } from './common/constants'
import WorkflowsEmptyState from './components/WorkflowsEmptyState'
import WorkflowsList from './components/WorkflowsList'
import useStoreWorkflows from './hooks/useStoreWorkflows'
import { useStoreWorkflowsApi } from './hooks/useStoreWorkflowsApi'
import WorkflowTemplatesViewContainer from './WorkflowTemplatesViewContainer'

import css from './WorkflowsView.less'

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

    const { path } = useRouteMatch()
    const location = useLocation()
    const isAutomateSettings = useIsAutomateSettings()

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

    const changeAutomateSettingButtomPosition = useFlag(
        FeatureFlagKey.ChangeAutomateSettingButtomPosition,
    )

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Workflows',
        })
    })

    const workflowsHeader = (
        <div className={css.pageHeaderContainer}>
            <PageHeader title={FLOWS}>
                <div className={css.headerContainer}>
                    <Button onClick={goToNewWorkflowPage} intent="secondary">
                        Create Custom Flow
                    </Button>
                    <Button onClick={goToWorkflowTemplatesPage}>
                        Create From Template
                    </Button>
                </div>
            </PageHeader>
        </div>
    )

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
                            css.descriptionContainerColumn,
                        )}
                    >
                        {isAutomateSettings ? (
                            <div className={css.settingsDescription}>
                                <div className={css.settingsDescriptionText}>
                                    <div className={css.descriptionText}>
                                        {WORKFLOWS_DESCRIPTION}
                                    </div>
                                    <div
                                        className={css.settingsDescriptionLinks}
                                    >
                                        <FlowsConfigurationLinks />
                                    </div>
                                </div>
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
                            </div>
                        ) : (
                            <div className={css.description}>
                                <div className={css.descriptionText}>
                                    {WORKFLOWS_DESCRIPTION}
                                </div>
                                <FlowsConfigurationLinks />
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
                goToWorkflowTemplatesPage={goToWorkflowTemplatesPage}
                goToNewWorkflowFromTemplatePage={
                    goToNewWorkflowFromTemplatePage
                }
            />
        )

    const baseURL = useMemo(() => {
        const base = isAutomateSettings
            ? '/app/settings/flows'
            : '/app/automation'
        return `${base}/${shopType}/${shopName}/flows`
    }, [isAutomateSettings, shopName, shopType])

    const isRootAutomateFlowsRoute = useMemo(
        () =>
            Boolean(
                matchPath(location.pathname, {
                    path: '/app/automation/:shopType/:shopName/flows',
                    exact: true,
                }),
            ),
        [location.pathname],
    )

    return (
        <Switch>
            <Route path={path} exact>
                <div className={css.container}>
                    {isRootAutomateFlowsRoute && workflowsHeader}
                    {workflowsElement}
                </div>
            </Route>
            <Route path={`${path}/quick-responses`} exact>
                <Redirect to={baseURL} />
            </Route>

            <Route path={`${path}/templates`} exact>
                <div className={css.container}>
                    {isRootAutomateFlowsRoute && workflowsHeader}
                    {createElement(
                        withUserRoleRequired(
                            WorkflowTemplatesViewContainer,
                            AGENT_ROLE,
                        ),
                    )}
                </div>
            </Route>
        </Switch>
    )
}

function FlowsConfigurationLinks() {
    return (
        <>
            <a
                href="https://link.gorgias.com/pnl"
                rel="noopener noreferrer"
                target="_blank"
                className={css.descriptionLink}
            >
                <i className="material-icons mr-2">ondemand_video</i>
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
        </>
    )
}
