import { campaignTrigger } from 'fixtures/campaign'
import type { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

import { isAllowedToUpdateTrigger } from '../isAllowedToUpdateTrigger'

describe('isAllowedToUpdateTrigger', () => {
    const lightTrigger = campaignTrigger as CampaignTrigger
    const notLightTrigger = {
        ...campaignTrigger,
        type: CampaignTriggerType.OrdersCount,
    }

    it.each([
        [lightTrigger, false, true],
        [lightTrigger, true, true],
        [notLightTrigger, false, false],
        [notLightTrigger, true, true],
    ])(
        'for trigger `%s` and isSubscriber `%s` should return `%s`',
        (trigger, isSubscriber, expected) => {
            expect(isAllowedToUpdateTrigger(trigger, isSubscriber)).toBe(
                expected,
            )
        },
    )
})
