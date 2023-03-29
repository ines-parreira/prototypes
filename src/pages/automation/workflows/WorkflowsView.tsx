import React from 'react'
import {Table, Container} from 'reactstrap'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import PageHeader from 'pages/common/components/PageHeader'
import Button from 'pages/common/components/button/Button'
import ReactSortable from 'pages/common/components/dragging/ReactSortable'
import ToggleInput from 'pages/common/forms/ToggleInput'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {WorkflowEntrypoint} from 'models/selfServiceConfiguration/types'
import IconButton from 'pages/common/components/button/IconButton'
import Tooltip from 'pages/common/components/Tooltip'
import css from './WorkflowsView.less'
import useWorflowsEntrypoints from './hooks/useWorkflowsEntrypoints'

type WorkflowsViewProps = {
    shopType: string
    shopName: string
    goToNewWorkflowPage: () => void
    goToEditWorkflowPage: (flowId: string) => void
    quickResponsesUrl: string
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
}

export default function WorkflowsView({
    shopName,
    shopType,
    goToNewWorkflowPage,
    goToEditWorkflowPage,
    quickResponsesUrl,
    notifyMerchant,
}: WorkflowsViewProps) {
    const {
        workflowsEntrypoints,
        handleDragAndDrop,
        deleteWorkflowEntrypoint,
        toggleEnabled,
        isFetchPending,
        isUpdatePending,
        isToggleUpdatePending,
        isEnabledLimitReached,
    } = useWorflowsEntrypoints(shopType, shopName, notifyMerchant)

    return (
        <div className="full-width overflow-auto">
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Flows">
                    <div className={css.headerContainer}>
                        <Button
                            className="float-right"
                            onClick={goToNewWorkflowPage}
                        >
                            Create flow
                        </Button>
                    </div>
                </PageHeader>
                <Container fluid className={css.pageContainer}>
                    <div className={css.pageContainerHeadline}>
                        {infoContainer}
                    </div>
                    <Table hover className="mb-0">
                        {tableHeader(
                            workflowsEntrypoints.length === 0 && !isFetchPending
                        )}
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
                            {isFetchPending && (
                                <>
                                    {skeletonRow}
                                    {skeletonRow}
                                    {skeletonRow}
                                </>
                            )}
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
                                        {!entrypoint.enabled &&
                                            isEnabledLimitReached && (
                                                <Tooltip
                                                    target={`toggle-entrypoint-${entrypoint.workflow_id}`}
                                                    placement="top"
                                                    trigger={['hover']}
                                                    autohide={false}
                                                >
                                                    You have reached the maximum
                                                    number of enabled flows.
                                                    Disable a flow or a{' '}
                                                    <Link
                                                        to={quickResponsesUrl}
                                                    >
                                                        quick response
                                                    </Link>{' '}
                                                    in order to enable this
                                                    flow.
                                                </Tooltip>
                                            )}
                                    </td>
                                    <td
                                        className={classNames(
                                            css.alignMiddle,
                                            css.title
                                        )}
                                        onClick={() => {
                                            goToEditWorkflowPage(
                                                entrypoint.workflow_id
                                            )
                                        }}
                                    >
                                        {entrypoint.name}
                                    </td>
                                    <td className={css.alignMiddle}>
                                        {deleteActionButton(
                                            entrypoint,
                                            deleteWorkflowEntrypoint,
                                            isUpdatePending
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </ReactSortable>
                    </Table>
                </Container>
            </div>
        </div>
    )
}

const infoContainer = (
    <div className={css.infoContainer}>
        <div
            className={css.description}
            data-candu-id="shopper-flows-description"
        >
            <p className="mb-2">
                Automate multi-step interactions in your chat widget with flows.
                If a customer needs more help, a ticket is created for an agent
                to handle.
            </p>
        </div>
    </div>
)

function deleteActionButton(
    entrypoint: WorkflowEntrypoint,
    handleDelete: (workflowId: string) => Promise<void>,
    isUpdatePending: boolean
) {
    return (
        <div className={css.actionButtonsWrapper}>
            <ConfirmationPopover
                buttonProps={{
                    intent: 'destructive',
                }}
                id={`delete-entrypoint-${entrypoint.workflow_id}`}
                content={
                    <>
                        You are about to delete <b>{entrypoint.label}</b>.
                    </>
                }
                onConfirm={() => {
                    void handleDelete(entrypoint.workflow_id)
                }}
            >
                {({uid, onDisplayConfirmation}) => (
                    <IconButton
                        className={css.actionButton}
                        onClick={onDisplayConfirmation}
                        fillStyle="ghost"
                        intent="destructive"
                        title="Delete flow"
                        id={uid}
                        isLoading={isUpdatePending}
                    >
                        delete
                    </IconButton>
                )}
            </ConfirmationPopover>
        </div>
    )
}

const tableHeader = (emptyRows: boolean) => (
    <>
        <colgroup>
            <col style={{width: 25}} />
            <col style={{width: 25}} />
            <col />
            <col style={{width: 50}} />
        </colgroup>
        <thead className="border-0">
            <tr>
                <td>
                    <i className={classNames('material-icons', css.arrowIcon)}>
                        arrow_downward
                    </i>
                </td>
                <td colSpan={3} className={css.tableHeaderTitle}>
                    Flows appear in the order below
                </td>
            </tr>
        </thead>
        {/* This is a hack to make the table header respect the colgroup widths
        defined above */}
        {emptyRows && (
            <tbody>
                <tr>
                    <td style={{padding: 0, border: 0}}></td>
                    <td style={{padding: 0, border: 0}}></td>
                    <td style={{padding: 0, border: 0}}></td>
                    <td style={{padding: 0, border: 0}}></td>
                </tr>
            </tbody>
        )}
    </>
)

const skeletonRow = (
    <tr className="draggable" data-testid="shopper-flows-skeleton-row">
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
            <ToggleInput
                isToggled={false}
                isLoading={true}
                onClick={() => {
                    //
                }}
            />
        </td>
        <td className={classNames(css.alignMiddle, css.title)}></td>
        <td className={css.alignMiddle}>
            <IconButton
                className={css.actionButton}
                fillStyle="ghost"
                intent="destructive"
                title="Delete flow"
                isLoading={true}
            >
                delete
            </IconButton>
        </td>
    </tr>
)
