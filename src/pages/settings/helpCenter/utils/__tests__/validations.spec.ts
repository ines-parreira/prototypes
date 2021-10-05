import {detectForbiddenDomain, isValidSubdomain} from '../validations'

describe('detectForbiddenDomain()', () => {
    it('returns no forbidden domain for subdomain "acme"', () => {
        expect(detectForbiddenDomain('acme')).toEqual(null)
    })

    it('returns a forbidden domain for subdomain "acme-test"', () => {
        expect(detectForbiddenDomain('acme-test')).toEqual('-test')
    })

    it('returns a forbidden domain for subdomain "admin"', () => {
        expect(detectForbiddenDomain('admin')).toEqual('admin')
    })

    it.each(['shit', 'hell'])(
        'returns a forbidden domain for subdomain containing forbidden words - %s',
        (value) => {
            expect(detectForbiddenDomain(value)).toEqual(value)
        }
    )
})

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
