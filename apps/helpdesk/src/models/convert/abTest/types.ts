import type {
    Components,
    Paths,
} from 'rest_api/revenue_addon_api/client.generated'

export type ABTestParams = (
    | Paths.GetAbTest.PathParameters
    | Paths.PatchAbTest.PathParameters
) & {
    channelConnectionId?: string
}

export type ABTestListParams = Paths.GetAbTests.QueryParameters

export type ABTest = Components.Schemas.ABTestResponseSchema

export type ABTestCreatePayload = Components.Schemas.ABTestCreateRequestSchema

export type ABTestUpdatePayload = Components.Schemas.ABTestPatchRequestSchema

export type ABTestListOptions = {
    channelConnectionId?: string
}
