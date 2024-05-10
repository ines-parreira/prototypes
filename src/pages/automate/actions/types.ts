import {Paths, Components} from 'rest_api/workflows_api/client.generated'
import {WorkflowStepHttpRequest} from 'pages/automate/workflows/models/workflowConfiguration.types'

export type StoreWorkflowsConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$201[number]

export type StoresWorkflowConfiguration = StoreWorkflowsConfiguration[]

type LlmPromptTrigger = NonNullable<
    Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto['triggers']
>[number]

type llmPromptEntryPoint = NonNullable<
    Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto['entrypoints']
>[number]

export interface CustomActionConfigurationFormInput
    extends Omit<StoreWorkflowsConfiguration, 'internal_id'> {
    internal_id?: string
    triggers: LlmPromptTrigger[]
    entrypoints: llmPromptEntryPoint[]
    steps: WorkflowStepHttpRequest[]
}
export type CustomActionFormInput = {
    name: string
    entrypoint: llmPromptEntryPoint
    trigger: LlmPromptTrigger
    httpStep: WorkflowStepHttpRequest
}
