import {Components} from 'rest_api/workflows_api/client.generated'

export type ListWfConfigurationsResponseDto =
    Components.Schemas.ListWfConfigurationsResponseDto
export type WfConfigurationResponseDto =
    Components.Schemas.ListWfConfigurationsResponseDto[number]

export type WorkflowConfigurationUpsertDto =
    Components.Schemas.UpsertWfConfigurationResponseDto

export type WorkflowConfigurationDto =
    | WorkflowConfigurationUpsertDto
    | Components.Schemas.GetWfConfigurationResponseDto
