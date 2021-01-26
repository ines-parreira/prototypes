import {advancedPlan, basicPlan, proPlan} from '../../fixtures/subscriptionPlan'
import {AccountFeatures} from '../../state/currentAccount/types'
import {Plan} from '../../models/billing/types'
import {getCheaperPlanForFeature} from '../paywalls'

const publicPlans = ({
    [basicPlan.id]: basicPlan,
    [proPlan.id]: proPlan,
    [advancedPlan.id]: advancedPlan,
} as unknown) as Record<string, Plan>

describe('getCheaperPlanForFeature()', () => {
    it('should return the cheaper plan to access the feature', () => {
        expect(
            getCheaperPlanForFeature(AccountFeatures.ChatCampaigns, publicPlans)
        ).toBe(proPlan.name)
    })
})
