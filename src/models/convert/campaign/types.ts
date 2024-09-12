import {Components, Paths} from 'rest_api/revenue_addon_api/client.generated'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

export type CampaignParams =
    | (
          | Paths.GetCampaign.PathParameters
          | Paths.PatchCampaign.PathParameters
          | Paths.DeleteCampaign.PathParameters
      ) & {channelConnectionId?: string}

export type CampaignListParams = Paths.GetCampaigns.QueryParameters

export type Campaign = Components.Schemas.CampaignResponseSchema

export type CampaignCreatePayload =
    Components.Schemas.CampaignCreateRequestSchema

export type CampaignUpdatePayload =
    Components.Schemas.CampaignPatchRequestSchema

export type Schedule = Components.Schemas.ScheduleResponseSchema

export type CampaignScheduleRequestPayload =
    Components.Schemas.ScheduleRequestSchema

export type CampaignListOptions = {
    channelConnectionId?: string
    channelConnectionExternalIds?: string[]
}

export enum InferredCampaignStatus {
    Active = 'active',
    Inactive = 'inactive',
    Deleted = 'deleted',
}

export type CampaignPreview = {
    id: string
    name: string
    variants: CampaignVariant[]
    status: InferredCampaignStatus
    is_light: boolean
} & Pick<Campaign, 'ab_group'>

export type ABGroup = Components.Schemas.ABGroupResponseSchema

export type CampaignPublishType = 'publish_now' | 'publish_later' | 'schedule'

export type Test = Components.Schemas.CampaignTriggerSchema
