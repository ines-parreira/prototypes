import _omit from 'lodash/omit'

import type { CampaignTrigger } from '../../types/CampaignTrigger'
import { CampaignTriggerBusinessHoursValuesEnum } from '../../types/enums/CampaignTriggerBusinessHoursValues.enum'
import { CampaignTriggerOperator } from '../../types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from '../../types/enums/CampaignTriggerType.enum'
import { createTrigger } from '../createTrigger'

const removeId = (trigger: CampaignTrigger) => _omit(trigger, 'id')

describe('createTrigger(key)', () => {
    it('throws an error if the key is not found', () => {
        expect(() =>
            createTrigger('invalid' as CampaignTriggerType),
        ).toThrowError('Trigger type "invalid" not implemented!')
    })

    it('creates "Business Hours" trigger with default settings', () => {
        expect(
            removeId(createTrigger(CampaignTriggerType.BusinessHours)),
        ).toStrictEqual({
            type: CampaignTriggerType.BusinessHours,
            operator: CampaignTriggerOperator.Eq,
            value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
        })
    })

    it('creates "Current URL" trigger with default settings', () => {
        expect(
            removeId(createTrigger(CampaignTriggerType.CurrentUrl)),
        ).toStrictEqual({
            type: CampaignTriggerType.CurrentUrl,
            operator: CampaignTriggerOperator.Contains,
            value: '/',
        })
    })

    it('creates "Time spent on page" trigger with default settings', () => {
        expect(
            removeId(createTrigger(CampaignTriggerType.TimeSpentOnPage)),
        ).toStrictEqual({
            type: CampaignTriggerType.TimeSpentOnPage,
            operator: CampaignTriggerOperator.Gt,
            value: 0,
        })
    })
})
