import {Paths, Components} from 'rest_api/workflows_api/client.generated'
import {ConditionSchema} from 'pages/automate/workflows/models/conditions.types'

export type StoreWorkflowsConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]
export type StoresWorkflowConfiguration = StoreWorkflowsConfiguration[]

export type StepHttpRequest = Extract<
    Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto['steps'][number],
    {kind: 'http-request'}
>

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
}

export type CustomInput = {
    id: LlmPromptTrigger['settings']['custom_inputs'][number]['id']
    name: LlmPromptTrigger['settings']['custom_inputs'][number]['name']
    instructions: LlmPromptTrigger['settings']['custom_inputs'][number]['instructions']
    dataType: LlmPromptTrigger['settings']['custom_inputs'][number]['data_type']
    isTemplateCustomInputs?: boolean
}

export type CustomActionFormInputValues = {
    requiresConfirmation: boolean
} & ActionFormInputValues &
    InputVariablesFormValues &
    ConditionsFormValues &
    HttpRequestFormValues

export type TemplateActionFormInputValues = ActionFormInputValues &
    InputVariablesFormValues &
    ConditionsFormValues

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

export type ActionApps = NonNullable<
    Paths.WfConfigurationControllerGet.Responses.$200['apps']
>[number]
