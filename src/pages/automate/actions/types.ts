import {Paths, Components} from 'rest_api/workflows_api/client.generated'
import {ConditionSchema} from 'pages/automate/workflows/models/conditions.types'

export type StoreWorkflowsConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]
export type StoresWorkflowConfiguration = StoreWorkflowsConfiguration[]

export type StepHttpRequest = Extract<
    Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto['steps'][number],
    {kind: 'http-request'}
>

export type ActionAppConnected = Components.Schemas.GetAppResponseDto

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
    Components.Schemas.ListWfConfigurationTemplatesResponseDto[number]

export interface CustomActionConfigurationFormInput
    extends Omit<StoreWorkflowsConfiguration, 'internal_id' | 'account_id'> {
    internal_id?: string
}

export interface TemplateConfigurationFormInput
    extends Omit<
        TemplateConfiguration,
        | 'internal_id'
        | 'account_id'
        | 'id'
        | 'initial_step_id'
        | 'created_datetime'
        | 'updated_datetime'
    > {
    id?: string
    internal_id?: string
    triggers: Trigger[]
    initial_step_id: string | null
}

export type CustomInput = {
    id: LlmPromptTrigger['settings']['custom_inputs'][number]['id']
    name: LlmPromptTrigger['settings']['custom_inputs'][number]['name']
    instructions: LlmPromptTrigger['settings']['custom_inputs'][number]['instructions']
    dataType: LlmPromptTrigger['settings']['custom_inputs'][number]['data_type']
    isTemplateCustomInputs?: boolean
}

export type CommonActionFormValues =
    | TemplateActionFormInputValues
    | CustomActionFormInputValues

export type CustomActionFormInputValues = {
    requiresConfirmation: boolean
} & ActionFormInputValues &
    InputVariablesFormValues &
    ConditionsFormValues &
    HttpRequestFormValues

export type TemplateActionFormInputValues = ActionFormInputValues &
    InputVariablesFormValues &
    ConditionsFormValues &
    ActionAppKey

interface ActionAppKey {
    appApiKey: string | null
}

export interface ActionFormInputValues {
    name: string
    isAvailableForAiAgent: boolean
    aiAgentInstructions: string
}

interface InputVariablesFormValues {
    customInput: CustomInput[]
}
interface ConditionsFormValues {
    conditionsType: 'and' | 'or' | null
    conditions: ConditionSchema[]
}

interface HttpRequestFormValues {
    httpUrl: StepHttpRequest['settings']['url']
    httpMethod: StepHttpRequest['settings']['method']
    httpHeaders: {name: string; value: string}[]
    httpBody: StepHttpRequest['settings']['body'] | null
    httpContentType: string | null
    outputsDescription: string
}

export type ActionAppsConfiguration = NonNullable<
    Components.Schemas.GetWfConfigurationResponseDto['apps']
>

export type ActionAppConfiguration = ActionAppsConfiguration[number]
