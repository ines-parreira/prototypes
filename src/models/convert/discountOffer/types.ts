import {Components, Paths} from 'rest_api/revenue_addon_api/client.generated'

export type UniqueDiscountOffer =
    Components.Schemas.DiscountOfferResponseSchema & {
        summary?: string
    }
export type UniqueDiscountListParams = Paths.GetDiscountOffers.QueryParameters

export type UniqueDiscountOfferCreatePayload =
    Components.Schemas.DiscountOfferCreateRequestSchema

export type UniqueDiscountOfferPatchPayload =
    Components.Schemas.DiscountOfferPatchRequestSchema
export type UniqueDiscountOfferPatchParams =
    Paths.PatchDiscountOffer.PathParameters

export type UniqueDiscountOfferDeleteParams =
    Paths.DeleteDiscountOffer.PathParameters

export type UniqueDiscountOfferTypeEnum =
    Components.Schemas.DiscountOfferTypeEnum
