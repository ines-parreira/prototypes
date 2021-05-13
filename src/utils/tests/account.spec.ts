import {isFeatureEnabled} from '../account'

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
})
