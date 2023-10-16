import React, {useMemo} from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'

import useStoreIntegrations from 'pages/automation/common/hooks/useStoreIntegrations'
import {compare} from 'utils'
import {LanguageCode} from '../models/workflowConfiguration.types'

import css from './WorkflowsList.less'
import WorkflowsRow from './WorkflowsRow'
export type Workflow = {
    workflow_id: string
    name: string
    available_languages: LanguageCode[]
}

type Props = {
    shopType: string
    shopName: string
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
    shopType,
    shopName,
    storeWorkflows: entrypoints,
    onDelete,
    onDuplicate,
    goToEditWorkflowPage,
    isUpdatePending,
    notifyMerchant,
}: Props) => {
    const storeIntegrations = useStoreIntegrations()
    const sortedStoreIntegrations = useMemo(
        () => [...storeIntegrations].sort((a, b) => compare(a.name, b.name)),
        [storeIntegrations]
    )

    return (
        <TableWrapper className={css.container}>
            <TableBody>
                {entrypoints.map((entrypoint) => (
                    <WorkflowsRow
                        shopType={shopType}
                        shopName={shopName}
                        key={entrypoint.workflow_id}
                        entrypoint={entrypoint}
                        goToEditWorkflowPage={goToEditWorkflowPage}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        isUpdatePending={isUpdatePending}
                        sortedStoreIntegrations={sortedStoreIntegrations}
                        notifyMerchant={notifyMerchant}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}

export default WorkflowsList
