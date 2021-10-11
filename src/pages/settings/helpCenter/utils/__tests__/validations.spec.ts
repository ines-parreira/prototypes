import {isValidSubdomain} from '../validations'

describe('isValidSubdomain()', () => {
    it('rejects empty subdomain', () => {
        expect(isValidSubdomain('')).toEqual(false)
    })

    it.each(['--test--', 'not a-subdomain', 'invalid-'])(
        'rejects invalid subdomain - %s',
        (value) => {
            expect(isValidSubdomain(value)).toEqual(false)
        }
    )

    it('accepts valid subdomain', () => {
        expect(isValidSubdomain('toto-faq')).toEqual(true)
    })
})
