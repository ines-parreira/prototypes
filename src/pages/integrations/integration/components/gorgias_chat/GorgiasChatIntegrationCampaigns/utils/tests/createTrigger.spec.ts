import {createTrigger} from '../createTrigger'

import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'
import {BusinessHoursOperators} from '../../types/enums/BusinessHoursOperators.enum'
import {CurrentUrlOperators} from '../../types/enums/CurrentUrlOperators.enum'
import {TimeSpentOnPageOperators} from '../../types/enums/TimeSpentOnPageOperators.enum'

describe('createTrigger(key)', () => {
    it('throws an error if the key is not found', () => {
        expect(() =>
            createTrigger('invalid' as CampaignTriggerKey)
        ).toThrowError('Trigger key "invalid" not implemented!')
    })

    it('creates "Business Hours" trigger with default settings', () => {
        expect(createTrigger(CampaignTriggerKey.BusinessHours)).toStrictEqual({
            key: CampaignTriggerKey.BusinessHours,
            value: true,
            operator: BusinessHoursOperators.DuringHours,
        })
    })

    it('creates "Current URL" trigger with default settings', () => {
        expect(createTrigger(CampaignTriggerKey.CurrentUrl)).toStrictEqual({
            key: CampaignTriggerKey.CurrentUrl,
            value: '/',
            operator: CurrentUrlOperators.Equal,
        })
    })

    it('creates "Time spent on page" trigger with default settings', () => {
        expect(createTrigger(CampaignTriggerKey.TimeSpentOnPage)).toStrictEqual(
            {
                key: CampaignTriggerKey.TimeSpentOnPage,
                value: 0,
                operator: TimeSpentOnPageOperators.GreaterThan,
            }
        )
    })
})
