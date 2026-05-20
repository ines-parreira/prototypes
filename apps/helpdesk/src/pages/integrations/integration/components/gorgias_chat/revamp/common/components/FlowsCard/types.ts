import type { Components } from 'rest_api/workflows_api/client.generated'

export const FLOWS_LIMIT = 6

export type Workflow = {
    workflow_id: string
    enabled: boolean
}

export type WorkflowConfiguration =
    Components.Schemas.ListWfConfigurationsResponseDto[number]
