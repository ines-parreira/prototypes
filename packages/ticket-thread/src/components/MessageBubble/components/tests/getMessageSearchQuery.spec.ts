import { getMessageSearchQuery } from '../MessageHeader/getMessageSearchQuery'

describe('getMessageSearchQuery', () => {
    it('returns null when meta is null', () => {
        expect(getMessageSearchQuery(null)).toBeNull()
    })

    it('returns null when meta is not an object', () => {
        expect(getMessageSearchQuery('string')).toBeNull()
        expect(getMessageSearchQuery(42)).toBeNull()
    })

    it('returns null when ai_campaign_id is missing', () => {
        expect(
            getMessageSearchQuery({
                ai_campaign_trigger_operator: 'aiSalesAgentHelpOnSearch',
                ai_campaign_trigger_value: 'blue sneakers',
            }),
        ).toBeNull()
    })

    it('returns null when ai_campaign_id is falsy', () => {
        expect(
            getMessageSearchQuery({
                ai_campaign_id: null,
                ai_campaign_trigger_operator: 'aiSalesAgentHelpOnSearch',
                ai_campaign_trigger_value: 'blue sneakers',
            }),
        ).toBeNull()
    })

    it('returns null when trigger operator is not aiSalesAgentHelpOnSearch', () => {
        expect(
            getMessageSearchQuery({
                ai_campaign_id: 'campaign-123',
                ai_campaign_trigger_operator: 'manual',
                ai_campaign_trigger_value: 'blue sneakers',
            }),
        ).toBeNull()
    })

    it('returns null when ai_campaign_trigger_value is missing', () => {
        expect(
            getMessageSearchQuery({
                ai_campaign_id: 'campaign-123',
                ai_campaign_trigger_operator: 'aiSalesAgentHelpOnSearch',
            }),
        ).toBeNull()
    })

    it('returns null when ai_campaign_trigger_value is an empty string', () => {
        expect(
            getMessageSearchQuery({
                ai_campaign_id: 'campaign-123',
                ai_campaign_trigger_operator: 'aiSalesAgentHelpOnSearch',
                ai_campaign_trigger_value: '',
            }),
        ).toBeNull()
    })

    it('returns the search query when all conditions are met', () => {
        expect(
            getMessageSearchQuery({
                ai_campaign_id: 'campaign-123',
                ai_campaign_trigger_operator: 'aiSalesAgentHelpOnSearch',
                ai_campaign_trigger_value: 'blue sneakers',
            }),
        ).toBe('blue sneakers')
    })
})
