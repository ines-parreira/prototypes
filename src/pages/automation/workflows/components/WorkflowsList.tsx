import React from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'

import useStoreIntegrations from 'pages/automation/common/hooks/useStoreIntegrations'
import {LanguageCode} from '../models/workflowConfiguration.types'

import css from './WorkflowsList.less'
import WorkflowsRow from './WorkflowsRow'

export type Workflow = {
    workflow_id: string
    name: string
    available_languages: LanguageCode[]
}

type Props = {
    storeIntegrationId: number
    storeWorkflows: Workflow[]
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
    onDelete: (workflowId: string) => Promise<void>
    onDuplicate: (
        workflowId: string,
        storeIntegrationId: number
    ) => Promise<{id: string}>
    goToEditWorkflowPage: (workflowId: string) => void
    isUpdatePending: boolean
}

const WorkflowsList = ({
    storeWorkflows: entrypoints,
    storeIntegrationId,
    onDelete,
    onDuplicate,
    goToEditWorkflowPage,
    isUpdatePending,
    notifyMerchant,
}: Props) => {
    const storeIntegrations = useStoreIntegrations()

    return (
        <TableWrapper className={css.container}>
            <TableBody>
                {entrypoints.map((entrypoint) => (
                    <WorkflowsRow
                        storeIntegrationId={storeIntegrationId}
                        key={entrypoint.workflow_id}
                        entrypoint={entrypoint}
                        goToEditWorkflowPage={goToEditWorkflowPage}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        isUpdatePending={isUpdatePending}
                        storeIntegrations={storeIntegrations}
                        notifyMerchant={notifyMerchant}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}

export default WorkflowsList
