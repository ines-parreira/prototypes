import React from 'react'
import {Container, Table} from 'reactstrap'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import ReactSortable from 'pages/common/components/dragging/ReactSortable'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Tooltip from 'pages/common/components/Tooltip'
import Loader from 'pages/common/components/Loader/Loader'
import {FeatureFlagKey} from 'config/featureFlags'
import Alert from 'pages/common/components/Alert/Alert'

import CreateWorkflowFooter from './components/CreateWorkflowFooter'
import DeleteWorkflowAction from './components/DeleteWorkflowAction'
import WorkflowsList from './components/WorkflowsList'
import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'

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
    quickResponsesUrl,
    connectedChannelsUrl,
    notifyMerchant,
}: WorkflowsViewProps) {
    const allowDifferentFlowsPerChannel =
        useFlags()[FeatureFlagKey.DifferentFlowsPerChannel]
    const {
        workflowsEntrypoints,
        handleDragAndDrop,
        deleteWorkflowEntrypoint,
        toggleEnabled,
        isFetchPending,
        isUpdatePending,
        isToggleUpdatePending,
        isEnabledLimitReached,
    } = useWorkflowsEntrypoints(shopType, shopName, notifyMerchant)

    const hasWorkflowsEntrypoints = workflowsEntrypoints.length > 0

    const WorkflowsTable = () => {
        if (allowDifferentFlowsPerChannel) {
            return (
                <WorkflowsList
                    entrypoints={workflowsEntrypoints}
                    onDelete={deleteWorkflowEntrypoint}
                    goToEditWorkflowPage={goToEditWorkflowPage}
                    isUpdatePending={isUpdatePending}
                />
            )
        }

        return (
            <Table hover className="mb-0">
                <colgroup>
                    <col style={{width: 25}} />
                    <col style={{width: 25}} />
                    <col />
                    <col style={{width: 50}} />
                </colgroup>
                <thead className="border-0">
                    <tr>
                        <td>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.arrowIcon
                                )}
                            >
                                arrow_downward
                            </i>
                        </td>
                        <td colSpan={3} className={css.tableHeaderTitle}>
                            Flows appear in the order below
                        </td>
                    </tr>
                </thead>
                <ReactSortable
                    tag="tbody"
                    options={{
                        draggable: '.draggable',
                        handle: '.drag-handle',
                        animation: 150,
                    }}
                    onChange={(sortedIds) => {
                        void handleDragAndDrop(sortedIds)
                    }}
                >
                    {workflowsEntrypoints.map((entrypoint) => (
                        <tr
                            className="draggable"
                            data-id={entrypoint.workflow_id}
                            key={entrypoint.workflow_id}
                        >
                            <td className={css.alignMiddle}>
                                <div
                                    className={classNames(
                                        'material-icons drag-handle',
                                        css.dragIcon
                                    )}
                                >
                                    drag_indicator
                                </div>
                            </td>
                            <td className={css.alignMiddle}>
                                <div
                                    id={`toggle-entrypoint-${entrypoint.workflow_id}`}
                                >
                                    <ToggleInput
                                        isToggled={entrypoint.enabled}
                                        isLoading={isToggleUpdatePending(
                                            entrypoint.workflow_id
                                        )}
                                        isDisabled={
                                            isUpdatePending ||
                                            (!entrypoint.enabled &&
                                                isEnabledLimitReached)
                                        }
                                        onClick={() => {
                                            void toggleEnabled(
                                                entrypoint.workflow_id
                                            )
                                        }}
                                    />
                                </div>
                                {!entrypoint.enabled && isEnabledLimitReached && (
                                    <Tooltip
                                        target={`toggle-entrypoint-${entrypoint.workflow_id}`}
                                        placement="top"
                                        trigger={['hover']}
                                        autohide={false}
                                    >
                                        You have reached the maximum number of
                                        enabled flows. Disable a flow or a{' '}
                                        <Link to={quickResponsesUrl}>
                                            quick response
                                        </Link>{' '}
                                        in order to enable this flow.
                                    </Tooltip>
                                )}
                            </td>
                            <td
                                className={classNames(
                                    css.alignMiddle,
                                    css.title
                                )}
                                onClick={() => {
                                    goToEditWorkflowPage(entrypoint.workflow_id)
                                }}
                            >
                                {entrypoint.name}
                            </td>
                            <td className={css.alignMiddle}>
                                <DeleteWorkflowAction
                                    onDelete={() => {
                                        void deleteWorkflowEntrypoint(
                                            entrypoint.workflow_id
                                        )
                                    }}
                                    isUpdatePending={isUpdatePending}
                                />
                            </td>
                        </tr>
                    ))}
                </ReactSortable>
            </Table>
        )
    }

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Flows">
                    {hasWorkflowsEntrypoints && (
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
                            <div>
                                <div className={css.description}>
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

                                {allowDifferentFlowsPerChannel && (
                                    <Alert icon className={css.alert}>
                                        Control where customers see flows in{' '}
                                        <Link to={connectedChannelsUrl}>
                                            connected channels
                                        </Link>
                                        .
                                    </Alert>
                                )}
                            </div>
                            {/*TODO: uncomment once video for flows is ready*/}
                            {/*<Video*/}
                            {/*    youtubeId="HFylY2x3T_Y"*/}
                            {/*    legend="Working with flows"*/}
                            {/*/>*/}
                        </div>
                    </div>
                    {hasWorkflowsEntrypoints ? (
                        <WorkflowsTable />
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
