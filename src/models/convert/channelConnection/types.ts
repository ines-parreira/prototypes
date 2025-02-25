import { Components, Paths } from 'rest_api/revenue_addon_api/client.generated'

export type ChannelConnectionParams =
    | Paths.GetChannelConnection.PathParameters
    | Paths.PatchChannelConnection.PathParameters
    | Paths.DeleteChannelConnection.PathParameters

export type ChannelConnection =
    Components.Schemas.ChannelConnectionResponseSchema

export type ChannelConnectionCreatePayload =
    Components.Schemas.ChannelConnectionCreateRequestSchema

export type ChannelConnectionUpdatePayload =
    Components.Schemas.ChannelPatchRequestSchema

export type ChannelConnectionListOptions = {
    storeIntegrationId?: number
    externalId?: string
    channel?: string
}

export enum ChannelConnectionChannel {
    Widget = 'widget',
}
