import {
    enterprisePlan,
    advancedPlan,
    basicPlan,
    proPlan,
} from '../../fixtures/subscriptionPlan'
import {AccountFeature} from '../../state/currentAccount/types'
import {Plan} from '../../models/billing/types'
import {getCheapestPlanForFeature, isLegacyPlan} from '../paywalls'
import {toJS} from '../../utils'

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

describe('isLegacyPlan()', () => {
    it('should return false for enterprise plan, no matter the public status', () => {
        const publicPlan = {...enterprisePlan, public: true}
        expect(isLegacyPlan(toJS(publicPlan))).toBe(false)

        const privatePlan = {...enterprisePlan, public: false}
        expect(isLegacyPlan(toJS(privatePlan))).toBe(false)
    })

    it.each([basicPlan, proPlan, advancedPlan])(
        'should return false for other public plans',
        (plan) => {
            expect(isLegacyPlan(toJS(plan))).toBe(false)
        }
    )

    it.each([basicPlan, proPlan, advancedPlan])(
        'should return true for other non public plans',
        (plan) => {
            const privatePlan = {...plan, public: false}
            expect(isLegacyPlan(toJS(privatePlan))).toBe(true)
        }
    )
})
