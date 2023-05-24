import React from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {WorkflowEntrypoint} from 'models/selfServiceConfiguration/types'

import DeleteWorkflowAction from './DeleteWorkflowAction'

import css from './WorkflowsList.less'

type Props = {
    entrypoints: Array<WorkflowEntrypoint & {name: string}>
    onDelete: (workflowId: string) => Promise<void>
    goToEditWorkflowPage: (workflowId: string) => void
    isUpdatePending: boolean
}

const WorkflowsList = ({
    entrypoints,
    onDelete,
    goToEditWorkflowPage,
    isUpdatePending,
}: Props) => {
    return (
        <TableWrapper className={css.container}>
            <TableBody>
                {entrypoints.map((entrypoint) => (
                    <TableBodyRow key={entrypoint.workflow_id}>
                        <BodyCell
                            className={css.name}
                            onClick={() => {
                                goToEditWorkflowPage(entrypoint.workflow_id)
                            }}
                        >
                            {entrypoint.name}
                        </BodyCell>
                        <BodyCell size="smallest">
                            <DeleteWorkflowAction
                                onDelete={() => {
                                    void onDelete(entrypoint.workflow_id)
                                }}
                                isUpdatePending={isUpdatePending}
                            />
                        </BodyCell>
                    </TableBodyRow>
                ))}
            </TableBody>
        </TableWrapper>
    )
}

export default WorkflowsList
