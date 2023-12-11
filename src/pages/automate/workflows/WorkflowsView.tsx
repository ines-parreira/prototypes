import React from 'react'
import {Container} from 'reactstrap'
import {Link} from 'react-router-dom'

// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useEffectOnce} from 'react-use'
import {useFlags} from 'launchdarkly-react-client-sdk'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Alert from 'pages/common/components/Alert/Alert'
import Video from 'pages/common/components/Video/Video'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {FLOWS} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import CreateWorkflowFooter from './components/CreateWorkflowFooter'
import WorkflowsList from './components/WorkflowsList'

import css from './WorkflowsView.less'
import useStoreWorkflows from './hooks/useStoreWorkflows'
import {useStoreWorkflowsApi} from './hooks/useStoreWorkflowsApi'

type WorkflowsViewProps = {
    shopType: string
    shopName: string
    goToWorkflowTemplatesPage: () => void
    goToEditWorkflowPage: (workflowId: string) => void
    quickResponsesUrl: string
    connectedChannelsUrl: string
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
}

export default function WorkflowsView({
    shopName,
    shopType,
    goToWorkflowTemplatesPage,
    goToEditWorkflowPage,
    notifyMerchant,
    connectedChannelsUrl,
}: WorkflowsViewProps) {
    useHistoryTracking(SegmentEvent.AutomateFlowsVisited)
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

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader title={FLOWS}>
                    {hasStoreWorkflows && (
                        <div className={css.headerContainer}>
                            <Button
                                className="float-right"
                                onClick={goToWorkflowTemplatesPage}
                            >
                                Create new flow
                            </Button>
                        </div>
                    )}
                </PageHeader>
            </div>

            {isFetchPending || !storeIntegrationId ? (
                <Loader data-testid="loader" />
            ) : (
                <Container fluid className={css.pageContainer}>
                    <div className={css.pageContainerHeadline}>
                        <div className={css.descriptionContainer}>
                            <div className={css.description}>
                                <div className={css.descriptionText}>
                                    Create and edit Flows to automate multi-step
                                    interactions in Chat, Help Center, and
                                    Contact Form.
                                </div>
                                <a
                                    href="https://docs.gorgias.com/en-US/flows-101-252069"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    className={css.descriptionLink}
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    Learn More About Flows
                                </a>
                                <a
                                    href="https://docs.gorgias.com/en-US/create-a-new-flow-256472"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    className={css.descriptionLink}
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    How To Create A Flow
                                </a>
                                <Alert icon className={css.alert}>
                                    Control where customers see Flows in{' '}
                                    <Link
                                        to={{
                                            pathname: connectedChannelsUrl,
                                            state: {from: 'workflow-alert'},
                                        }}
                                    >
                                        channels
                                    </Link>
                                    .
                                </Alert>
                            </div>
                            <Video
                                youtubeId="yQ9Rj0k9UiM"
                                legend="Working with Flows"
                            />
                        </div>
                    </div>
                    {hasStoreWorkflows ? (
                        <WorkflowsList
                            storeIntegrationId={storeIntegrationId}
                            notifyMerchant={notifyMerchant}
                            storeWorkflows={workflows}
                            onDelete={(workflowId) =>
                                removeWorkflowFromStore(
                                    workflowId,
                                    storeIntegrationId
                                )
                            }
                            onDuplicate={duplicateWorkflow}
                            goToEditWorkflowPage={goToEditWorkflowPage}
                            isUpdatePending={isUpdatePending}
                        />
                    ) : (
                        <CreateWorkflowFooter
                            goToWorkflowTemplatesPage={
                                goToWorkflowTemplatesPage
                            }
                        />
                    )}
                </Container>
            )}
        </div>
    )
}
