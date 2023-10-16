import React, {useCallback, useState} from 'react'
import {Container} from 'reactstrap'
import {Link} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Alert from 'pages/common/components/Alert/Alert'
import Video from 'pages/common/components/Video/Video'

import {NotificationStatus} from 'state/notifications/types'
import {useSelfServiceConfigurationUpdate} from '../common/hooks/useSelfServiceConfigurationUpdate'
import CreateWorkflowFooter from './components/CreateWorkflowFooter'
import WorkflowsList from './components/WorkflowsList'
import useStoreWorkflows from './hooks/useStoreWorkflows'

import css from './WorkflowsView.less'
import useWorkflowApi from './hooks/useWorkflowApi'

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
    const [isDuplicatingDifferentStore, setIsDuplicatingDifferentStore] =
        useState(false)
    const {
        storeWorkflows,
        removeWorkflowFromStore: deleteWorkflowEntrypoint,
        duplicateWorkflow: duplicateCurrentStoreWorkflow,
        isFetchPending,
        storeIntegrationId: currentStoreIntegrationId,
        isUpdatePending,
    } = useStoreWorkflows(shopType, shopName, notifyMerchant)

    const {duplicateWorkflowConfiguration} = useWorkflowApi()
    const {
        handleSelfServiceConfigurationUpdate,
        isUpdatePending: isDifferentStoreUpdatePending,
    } = useSelfServiceConfigurationUpdate({
        handleNotify: (notify) => {
            if (notify.status === NotificationStatus.Error && notify.message) {
                notifyMerchant(notify.message, 'error')
            }
        },
    })

    const duplicateWorkflow = useCallback(
        async (workflowId: string, storeIntegrationId: number) => {
            if (currentStoreIntegrationId === storeIntegrationId) {
                const duplicatedCurrentStoreWorkflow =
                    await duplicateCurrentStoreWorkflow(workflowId)
                return {
                    id: duplicatedCurrentStoreWorkflow.id,
                }
            }
            setIsDuplicatingDifferentStore(true)
            const duplicatedWorkflow = await duplicateWorkflowConfiguration(
                workflowId
            )
            await handleSelfServiceConfigurationUpdate(
                (draft) => {
                    draft.workflows_entrypoints ??= []
                    draft.workflows_entrypoints?.unshift({
                        workflow_id: duplicatedWorkflow.id,
                    })
                },
                undefined,
                storeIntegrationId
            )
            setIsDuplicatingDifferentStore(false)
            return {id: duplicatedWorkflow.id}
        },
        [
            currentStoreIntegrationId,
            duplicateCurrentStoreWorkflow,
            handleSelfServiceConfigurationUpdate,
            duplicateWorkflowConfiguration,
        ]
    )

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
                            shopType={shopType}
                            shopName={shopName}
                            notifyMerchant={notifyMerchant}
                            storeWorkflows={storeWorkflows}
                            onDelete={deleteWorkflowEntrypoint}
                            onDuplicate={duplicateWorkflow}
                            goToEditWorkflowPage={goToEditWorkflowPage}
                            isUpdatePending={
                                isUpdatePending ||
                                isDuplicatingDifferentStore ||
                                isDifferentStoreUpdatePending
                            }
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
