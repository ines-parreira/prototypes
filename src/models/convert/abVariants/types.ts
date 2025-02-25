import { Components, Paths } from 'rest_api/revenue_addon_api/client.generated'

export type ABVariantParams =
    | Paths.CreateAbGroup.PathParameters
    | Paths.StopAbGroup.PathParameters
    | Paths.StartAbGroup.PathParameters
    | Paths.PauseAbGroup.PathParameters

export type ABVariant = Components.Schemas.ABGroupResponseSchema

export type ABStopRequestPayload = Components.Schemas.ABGroupStopRequestSchema
