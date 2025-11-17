import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import type {
    LanguageCode,
    WorkflowConfigurationShallow,
} from '../models/workflowConfiguration.types'
import WorkflowRow from './WorkflowRow'

export type Workflow = {
    workflow_id: string
    name: string
    available_languages: LanguageCode[]
    updated_datetime: string
}

type Props = {
    storeIntegrationId: number
    workflows: WorkflowConfigurationShallow[]
    notifyMerchant: (message: string, kind: 'success' | 'error') => void
    onDelete: (workflowId: string) => Promise<void>
    onDuplicate: (
        workflowId: string,
        storeIntegrationId: number,
    ) => Promise<{ id: string }>
    goToEditWorkflowPage: (workflowId: string) => void
    isUpdatePending: boolean
}

const WorkflowsList = ({
    workflows,
    storeIntegrationId,
    onDelete,
    onDuplicate,
    goToEditWorkflowPage,
    isUpdatePending,
    notifyMerchant,
}: Props) => {
    const storeIntegrations = useStoreIntegrations()

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCellProperty title="Flow" />
                <HeaderCellProperty title="Languages" />
                <HeaderCellProperty title="Last updated" />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {workflows.map((workflow) => (
                    <WorkflowRow
                        storeIntegrationId={storeIntegrationId}
                        key={workflow.id}
                        workflow={workflow}
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
