import {produce} from 'immer'
import {Map} from 'immutable'
import _trim from 'lodash/trim'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {
    CampaignContactFormAttachment,
    CampaignProductRecommendation,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import {CampaignProduct} from 'pages/convert/campaigns/types/CampaignProduct'
import {CampaignTrigger} from 'pages/convert/campaigns/types/CampaignTrigger'

import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {transformDiscountOfferToAttachment} from 'pages/convert/campaigns/utils/transformDiscountOfferToAttachment'
import {transformProductToAttachment} from 'pages/convert/campaigns/utils/transformProductToAttachment'

type CreateCampaignPayloadType = {
    campaignData: Campaign
    triggers: CampaignTrigger[]
    isConvertSubscriber: boolean
    chatMultiLanguagesEnabled: boolean
    shopifyProducts: CampaignProduct[]
    discountOffers: CampaignDiscountOffer[]
    productRecommendations: CampaignProductRecommendation[]
    contactForm: CampaignContactFormAttachment[]
    shopifyIntegration: Map<any, any>
    canChangeStatus: boolean
    isActive: boolean
    utmEnabled: boolean
    utmQueryString: string
}

export const createCampaignPayload = ({
    campaignData,
    triggers,
    shopifyIntegration,
    shopifyProducts = [],
    discountOffers = [],
    productRecommendations = [],
    contactForm = [],
    chatMultiLanguagesEnabled = true,
    isConvertSubscriber = false,
    canChangeStatus = false,
    isActive = false,
    utmEnabled = true,
    utmQueryString = '',
}: CreateCampaignPayloadType): Campaign => {
    const payload: Campaign = produce(campaignData, (draft) => {
        const trimmedCampaignName = _trim(draft.name)

        draft.name = trimmedCampaignName
        draft.triggers = triggers.filter((trigger) => {
            return trigger.type !== CampaignTriggerType.SingleInView
        })

        draft.trigger_rule = createTriggerRule(draft.triggers)

        if (!chatMultiLanguagesEnabled) {
            delete draft.language
        }

        draft.attachments = [...productRecommendations, ...contactForm]

        if (discountOffers.length > 0) {
            const discountOfferAttachment = transformDiscountOfferToAttachment(
                discountOffers[0]
            )

            draft.attachments = [
                ...(draft.attachments || []),
                discountOfferAttachment,
            ]
        }
        if (shopifyProducts.length > 0) {
            const productAttachments = shopifyProducts.map((product) => {
                return transformProductToAttachment(
                    product,
                    {
                        campaignName: trimmedCampaignName,
                        currency: shopifyIntegration.getIn([
                            'meta',
                            'currency',
                        ]),
                    },
                    isConvertSubscriber,
                    utmEnabled,
                    utmQueryString
                )
            })

            draft.attachments = [
                ...(draft.attachments || []),
                ...productAttachments,
            ]
        }

        if (canChangeStatus) {
            if (!isActive) {
                draft.status = CampaignStatus.Inactive
            } else {
                draft.status = CampaignStatus.Active
            }
        }
    })

    return payload
}
