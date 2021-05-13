import {fromJS} from 'immutable'

import {isFeatureEnabled} from '../account'

describe('account utils', () => {
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
