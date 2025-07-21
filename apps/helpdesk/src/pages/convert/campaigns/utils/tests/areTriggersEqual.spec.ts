import { campaignTrigger } from 'fixtures/campaign'

import { areTriggersEqual } from '../areTriggersEqual'

describe('areTriggersEqual', () => {
    it('should return true when triggers are equal', () => {
        const b = {
            ...campaignTrigger,
            id: '01J52T7ATKQXVT5QTWK11GBENF',
        }
        expect(areTriggersEqual(campaignTrigger, b)).toBe(true)
    })
    it('should return false when triggers are not equal', () => {
        const b = {
            ...campaignTrigger,
            value: campaignTrigger.value + 1,
        }
        expect(areTriggersEqual(campaignTrigger, b)).toBe(false)
    })
})
