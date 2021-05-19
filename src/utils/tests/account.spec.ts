import {hasLegacyPlan, isFeatureEnabled} from '../account'
import {account} from '../../fixtures/account'
import plan from '../../fixtures/plan'

describe('account utils', () => {
    describe('isFeatureEnabled()', () => {
        it.each([true, {enabled: true}])(
            'should return true',
            (featureMetadata) => {
                expect(isFeatureEnabled(featureMetadata)).toBe(true)
            }
        )

        it.each([false, {enabled: false}])(
            'should return false',
            (featureMetadata) => {
                expect(isFeatureEnabled(featureMetadata)).toBe(false)
            }
        )
    })

    describe('hasLegacyPlan', () => {
        it.each([
            [
                'a custom plan that is not public',
                account,
                {...plan, custom: false, public: false},
            ],
            [
                'legacy features',
                {...account, meta: {has_legacy_features: true}},
                plan,
            ],
        ])(
            'should return true when account has %s',
            (testName, accountMock, planMock) => {
                expect(hasLegacyPlan(accountMock, planMock)).toBe(true)
            }
        )

        it.each([
            [
                'a plan is custom and public',
                {...plan, custom: true, public: true},
            ],
            ['empty plan', {}],
        ])('should return false when account has %s', (testName, planMock) => {
            expect(hasLegacyPlan(account, planMock)).toBe(false)
        })
    })
})
