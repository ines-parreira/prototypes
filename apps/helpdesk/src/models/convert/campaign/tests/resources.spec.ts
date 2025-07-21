import _omit from 'lodash/omit'

import { campaign, campaignId } from 'fixtures/campaign'
import { channelConnectionId } from 'fixtures/channelConnection'
import {
    CampaignCreatePayload,
    CampaignSuggestCopyPayload,
} from 'models/convert/campaign/types'
import { RevenueAddonClient } from 'rest_api/revenue_addon_api/client'

import * as resources from '../resources'

jest.mock('rest_api/revenue_addon_api/client')

describe('Campaign resources', () => {
    describe('getCampaign', () => {
        it('should resolve with a Campaign on success', async () => {
            const client = {
                get_campaign: jest.fn().mockReturnValue(campaign),
            } as unknown as RevenueAddonClient

            const res = await resources.getCampaign(client, {
                campaign_id: campaignId,
            })
            expect(res).toEqual(campaign)
        })
    })

    describe('listCampaigns', () => {
        it('should resolve with a list of Campaigns on success', async () => {
            const client = {
                get_campaigns: jest.fn().mockReturnValue([campaign]),
            } as unknown as RevenueAddonClient

            const res = await resources.listCampaigns(client, {
                channelConnectionId: channelConnectionId,
            })
            expect(res).toEqual([campaign])
        })
    })

    describe('createCampaign', () => {
        it('should resolve with the created Campaign on success', async () => {
            const client = {
                create_campaign: jest.fn().mockReturnValue(campaign),
            } as unknown as RevenueAddonClient

            const res = await resources.createCampaign(client, {
                ..._omit(campaign, [
                    'id',
                    'created_datetime',
                    'updated_datetime',
                    'deleted_datetime',
                ]),
                channel_connection_id: channelConnectionId,
            } as CampaignCreatePayload)
            expect(res).toEqual(campaign)
        })
    })

    describe('updateCampaign', () => {
        it('should resolve with the updated Campaign on success', async () => {
            const newName = 'New Welcome Campaign'
            const client = {
                patch_campaign: jest.fn().mockReturnValue({
                    ...campaign,
                    name: newName,
                }),
            } as unknown as RevenueAddonClient

            const res = await resources.updateCampaign(
                client,
                {
                    campaign_id: campaignId,
                },
                {
                    name: newName,
                },
            )
            expect(res).toEqual({ ...campaign, name: newName })
        })
    })

    describe('deleteCampaign', () => {
        it('should resolve with the deleted Campaign on success', async () => {
            const client = {
                delete_campaign: jest.fn(),
            } as unknown as RevenueAddonClient

            const res = await resources.deleteCampaign(client, {
                campaign_id: campaignId,
            })
            expect(res).toEqual(undefined)
        })
    })

    describe('suggestCampaignCopy', () => {
        it('should suggest multiple campaign copy suggestions', async () => {
            const suggestions = ['suggestion1', 'suggestion2']
            const client = {
                suggest_campaign_copy: jest.fn().mockReturnValue(suggestions),
            } as unknown as RevenueAddonClient

            const res = await resources.suggestCampaignCopy(client, {
                store_domain: 'best-shop.gorgias.com',
                title: campaign.name,
                language: campaign.language || undefined,
                message: campaign.message_text,
                triggers: [],
            } as CampaignSuggestCopyPayload)

            expect(res).toEqual(suggestions)
        })
    })
})
