import {Paths, Components} from 'rest_api/workflows_api/client.generated'
import {WorkflowStepHttpRequest} from 'pages/automate/workflows/models/workflowConfiguration.types'

export type StoreWorkflowsConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]
export type StoresWorkflowConfiguration = StoreWorkflowsConfiguration[]

export type Trigger =
    Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto['triggers'][number]
export type Entrypoint =
    Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto['entrypoints'][number]

export type LlmPromptTrigger = Extract<Trigger, {kind: 'llm-prompt'}>
export type LlmConversationEntrypoint = Extract<
    Entrypoint,
    {kind: 'llm-conversation'}
>

export type TemplateConfiguration =
    Paths.WfConfigurationTemplateControllerList.Responses.$200[number]

export interface CustomActionConfigurationFormInput
    extends Omit<StoreWorkflowsConfiguration, 'internal_id' | 'account_id'> {
    internal_id?: string
    steps: WorkflowStepHttpRequest[]
    triggers: LlmPromptTrigger[]
    entrypoints: LlmConversationEntrypoint[]
}

export type ActionApps = NonNullable<
    Paths.WfConfigurationControllerGet.Responses.$200['apps']
>[number]
