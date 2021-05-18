import {advancedPlan, basicPlan, proPlan} from '../../fixtures/subscriptionPlan'
import {AccountFeature} from '../../state/currentAccount/types'
import {Plan} from '../../models/billing/types'
import {getCheapestPlanForFeature} from '../paywalls'

const publicPlans: Record<string, Plan> = {
    [basicPlan.id]: basicPlan,
    [proPlan.id]: proPlan,
    [advancedPlan.id]: advancedPlan,
}

describe('getCheapestPlanForFeature()', () => {
    it.each(Object.values(AccountFeature))(
        'should return the cheaper plan to access the feature %s',
        (feature) => {
            expect(
                getCheapestPlanForFeature(feature, publicPlans)
            ).toMatchSnapshot()
        }
    )
})
