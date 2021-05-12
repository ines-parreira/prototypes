import {fromJS} from 'immutable'

import {
    isAccountCreatedBeforeFeatureBasedPlans,
    isFeatureEnabled,
} from '../account'

describe('account utils', () => {
    describe('isAccountCreatedBeforeFeatureBasedPlans()', () => {
        it.each(['2021-01-01', '2021-01-31'])(
            'should return true',
            (createdAt) => {
                expect(isAccountCreatedBeforeFeatureBasedPlans(createdAt)).toBe(
                    true
                )
            }
        )

        it.each(['2021-02-01', '2021-03-01'])(
            'should return false',
            (createdAt) => {
                expect(isAccountCreatedBeforeFeatureBasedPlans(createdAt)).toBe(
                    false
                )
            }
        )
    })

    describe('isFeatureEnabled()', () => {
        it.each([true, fromJS({enabled: true})])(
            'should return true',
            (featureMetadata) => {
                expect(isFeatureEnabled(featureMetadata)).toBe(true)
            }
        )

        it.each([false, fromJS({enabled: false})])(
            'should return false',
            (featureMetadata) => {
                expect(isFeatureEnabled(featureMetadata)).toBe(false)
            }
        )
    })
})
