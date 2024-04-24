import {Components, Paths} from 'rest_api/revenue_addon_api/client.generated'

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

export type CampaignListOptions = {
    channelConnectionId?: string
    channelConnectionExternalIds?: string[]
}

export type CampaignPreview = {
    id: string
    name: string
    is_light: boolean
}
