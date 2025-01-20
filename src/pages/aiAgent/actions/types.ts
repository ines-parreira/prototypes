import {
    HttpRequestNodeType,
    LLMPromptTriggerNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {WfConfigurationResponseDto} from 'pages/automate/workflows/types'
import {Paths, Components} from 'rest_api/workflows_api/client.generated'

export type StoreWorkflowsConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]
export type StoresWorkflowConfiguration = StoreWorkflowsConfiguration[]

export type ActionAppConnected = Components.Schemas.GetAppResponseDto

export type Trigger =
    Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto['triggers'][number]
export type LlmPromptTrigger = Extract<Trigger, {kind: 'llm-prompt'}>

export type TemplateConfiguration =
    Components.Schemas.ListWfConfigurationTemplatesResponseDto[number]

export type CustomInput = LlmPromptTrigger['settings']['custom_inputs'][number]
export type ObjectInput = LlmPromptTrigger['settings']['object_inputs'][number]

export type Input =
    | CustomInput
    | Omit<Extract<ObjectInput, {kind: 'product'}>, 'integration_id'>
export type MerchantInput = Exclude<
    WfConfigurationResponseDto['inputs'],
    null | undefined
>[number]

export type ActionFormInputValues = {
    name: string
    trigger: LLMPromptTriggerNodeType['data']
}

export type CustomActionFormInputValues = ActionFormInputValues & {
    http: HttpRequestNodeType['data']
}

export type TemplateActionFormInputValues = ActionFormInputValues & {
    apps: TemplateConfiguration['apps']
    inputs: VisualBuilderGraph['inputs']
    values: VisualBuilderGraph['values']
}

export type ActionAppsConfiguration = NonNullable<
    Components.Schemas.GetWfConfigurationResponseDto['apps']
>

export type ActionAppConfiguration = ActionAppsConfiguration[number]

export type LlmTriggeredExecution =
    Components.Schemas.GetWfExecutionResponseDto &
        Components.Schemas.GetExecutionsPaginationResponseDto['data'][number]

export type HTTPExecutionLogs = Components.Schemas.HttpRequestEventsResponseDto

export type ActionStepItem = ValueOf<
    NonNullable<LlmTriggeredExecution['state']['steps_state']>
> & {
    success?: boolean
    stepId: string
    steps_state?: LlmTriggeredExecution['state']['steps_state']
    error?: Record<string, unknown>
}
