import React from 'react'
import {Container} from 'reactstrap'
import {Link} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Alert from 'pages/common/components/Alert/Alert'
import Video from 'pages/common/components/Video/Video'

import CreateWorkflowFooter from './components/CreateWorkflowFooter'
import WorkflowsList from './components/WorkflowsList'
import useStoreWorkflows from './hooks/useStoreWorkflows'

import css from './WorkflowsView.less'

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
    connectedChannelsUrl,
    notifyMerchant,
}: WorkflowsViewProps) {
    const {
        storeWorkflows,
        removeWorkflowFromStore: deleteWorkflowEntrypoint,
        duplicateWorkflow,
        isFetchPending,
        isUpdatePending,
    } = useStoreWorkflows(shopType, shopName, notifyMerchant)

    const hasStoreWorkflows = storeWorkflows.length > 0

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Flow builder">
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

            {isFetchPending ? (
                <Loader data-testid="loader" />
            ) : (
                <Container fluid className={css.pageContainer}>
                    <div className={css.pageContainerHeadline}>
                        <div className={css.descriptionContainer}>
                            <div className={css.description}>
                                <div className={css.descriptionText}>
                                    Create and edit flows to automate multi-step
                                    interactions.
                                </div>
                                <a
                                    href="https://docs.gorgias.com/en-US/setting-up-multi-step-flows-246591"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    How To Set Up Flows
                                </a>

                                <Alert icon className={css.alert}>
                                    Control where customers see flows in{' '}
                                    <Link to={connectedChannelsUrl}>
                                        connected channels
                                    </Link>
                                    .
                                </Alert>
                            </div>
                            <Video
                                youtubeId="yQ9Rj0k9UiM"
                                legend="Working with flows"
                            />
                        </div>
                    </div>
                    {hasStoreWorkflows ? (
                        <WorkflowsList
                            storeWorkflows={storeWorkflows}
                            onDelete={deleteWorkflowEntrypoint}
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
