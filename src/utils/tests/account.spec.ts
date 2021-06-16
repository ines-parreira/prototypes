import {isFeatureEnabled} from '../account'

describe('account utils', () => {
    describe('isFeatureEnabled()', () => {
        it('should return true', () => {
            expect(isFeatureEnabled({enabled: true})).toBe(true)
        })

        it('should return false', () => {
            expect(isFeatureEnabled({enabled: false})).toBe(false)
        })
    })
})
