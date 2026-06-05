import type { ListTrackstarConnectionsResponseItem } from '@gorgias/workflows-types'

import type { Components } from 'rest_api/workflows_api/client.generated'

export type ListWfConfigurationsResponseDto =
    Components.Schemas.ListWfConfigurationsResponseDto
export type WfConfigurationResponseDto =
    Components.Schemas.ListWfConfigurationsResponseDto[number]

export type WorkflowConfigurationUpsertDto =
    Components.Schemas.UpsertWfConfigurationResponseDto

export type WorkflowConfigurationDto =
    | WorkflowConfigurationUpsertDto
    | Components.Schemas.GetWfConfigurationResponseDto

// The SDK's integration_name union is currently narrower than what the backend
// can return (missing 'deposco' and 'bluebox' — see TRACKSTAR_INTEGRATIONS in
// pages/automate/actionsPlatform). Widen here until the upstream spec catches up.
export type TrackstarConnection = Omit<
    ListTrackstarConnectionsResponseItem,
    'integration_name'
> & {
    integration_name:
        | ListTrackstarConnectionsResponseItem['integration_name']
        | 'deposco'
        | 'bluebox'
}
