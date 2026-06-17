import { getMessageCampaignId } from '#ticket-messages/components/MessageBubble/components/MessageHeader/getMessageCampaignId'

describe('getMessageCampaignId', () => {
    it('returns null when meta is null', () => {
        expect(getMessageCampaignId(null)).toBeNull()
    })

    it('returns null when meta is undefined', () => {
        expect(getMessageCampaignId(undefined)).toBeNull()
    })

    it('returns null when meta is not an object', () => {
        expect(getMessageCampaignId('string')).toBeNull()
        expect(getMessageCampaignId(42)).toBeNull()
        expect(getMessageCampaignId(true)).toBeNull()
    })

    it('returns null when campaign_id is missing', () => {
        expect(getMessageCampaignId({})).toBeNull()
        expect(getMessageCampaignId({ other_field: 'value' })).toBeNull()
    })

    it('returns null when campaign_id is null', () => {
        expect(getMessageCampaignId({ campaign_id: null })).toBeNull()
    })

    it('returns null when campaign_id is an empty string', () => {
        expect(getMessageCampaignId({ campaign_id: '' })).toBeNull()
    })

    it('returns null when campaign_id is 0', () => {
        expect(getMessageCampaignId({ campaign_id: 0 })).toBeNull()
    })

    it('returns null when campaign_id is an object', () => {
        expect(getMessageCampaignId({ campaign_id: { id: 123 } })).toBeNull()
    })

    it('returns null when campaign_id is an array', () => {
        expect(getMessageCampaignId({ campaign_id: [123] })).toBeNull()
    })

    it('returns the string campaign_id as-is', () => {
        expect(getMessageCampaignId({ campaign_id: 'campaign-123' })).toBe(
            'campaign-123',
        )
    })

    it('converts a numeric campaign_id to a string', () => {
        expect(getMessageCampaignId({ campaign_id: 456 })).toBe('456')
    })

    it('ignores unrelated meta fields and returns campaign_id', () => {
        expect(
            getMessageCampaignId({
                campaign_id: 'abc',
                ai_campaign_id: 'other',
                some_other: true,
            }),
        ).toBe('abc')
    })
})
