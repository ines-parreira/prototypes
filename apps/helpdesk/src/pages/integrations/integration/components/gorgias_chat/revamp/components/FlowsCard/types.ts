import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { Components } from 'rest_api/workflows_api/client.generated'

export const FLOWS_LIMIT = 6

export type Workflow = {
    workflow_id: string
    enabled: boolean
}

export type WorkflowConfiguration =
    Components.Schemas.ListWfConfigurationsResponseDto[number]

export type FlowItemProps = {
    index: number
    label: string
    channelType: string
    editUrl: string
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    onDelete: () => void
}

export type FlowsListProps = {
    items: Workflow[]
    channelType: string
    configurationsMap: Record<string, WorkflowConfiguration>
    getEditFlowLink: (workflowId: string) => string
    onReorder: (reorderedWorkflows: Workflow[]) => void
    onRemove: (workflowId: string) => void
}

export type FlowsSettingsProps = {
    workflowEntrypoints: SelfServiceConfiguration['workflowsEntrypoints']
    configurations: Components.Schemas.ListWfConfigurationsResponseDto
    automationSettingsWorkflows: Workflow[]
    primaryLanguage: string
    shopName: string
    shopType: string
    channel: SelfServiceChannel
    channelType: string
    onChange?: (
        updatedWorkflows: Workflow[],
        action: 'add' | 'remove' | 'reorder',
    ) => void
}
