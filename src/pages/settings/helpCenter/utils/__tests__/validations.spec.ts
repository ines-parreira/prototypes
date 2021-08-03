import {isValidSubdomain} from '../validations'

describe('isValidSubdomain()', () => {
    it.each(['not a-subdomain', '', 'invalid-'])(
        'rejects invalid subdomain - %s',
        (value) => {
            expect(isValidSubdomain(value)).toEqual(false)
        }
    )

    it.each(['shit', 'hell'])(
        'rejects subdomain containing forbidden words - %s',
        (value) => {
            expect(isValidSubdomain(value)).toEqual(false)
        }
    )

    it('accepts valid subdomain', () => {
        expect(isValidSubdomain('toto-faq')).toEqual(true)
    })
})
