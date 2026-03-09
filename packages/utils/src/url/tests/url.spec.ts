import {
    attachSearchParamsToUrl,
    encodeRFC3986URIComponent,
    ensureHTTPS,
} from '../url'

describe('ensureHTTPS', () => {
    it('prepends https:// for undefined input', () => {
        expect(ensureHTTPS()).toBe('https://')
    })

    it('prepends https:// for empty string input', () => {
        expect(ensureHTTPS('')).toBe('https://')
    })

    it('keeps https URLs unchanged', () => {
        expect(ensureHTTPS('https://example.com')).toBe('https://example.com')
    })

    it('keeps root-relative paths unchanged', () => {
        expect(ensureHTTPS('/api/endpoint')).toBe('/api/endpoint')
    })

    it('converts http to https', () => {
        expect(ensureHTTPS('http://example.com')).toBe('https://example.com')
    })

    it('handles malformed http variations', () => {
        expect(ensureHTTPS('http:/example.com')).toBe('https://example.com')
        expect(ensureHTTPS('http:example.com')).toBe('https://example.com')
        expect(ensureHTTPS('HTTP://example.com')).toBe('https://example.com')
        expect(ensureHTTPS('HTTPS:/example.com')).toBe('https://example.com')
        expect(ensureHTTPS('https/example.com')).toBe('https://example.com')
        expect(ensureHTTPS('https//example.com')).toBe('https://example.com')
    })

    it('prepends https:// to bare domains', () => {
        expect(ensureHTTPS('example.com')).toBe('https://example.com')
    })

    it('prepends https:// to bare domains with paths', () => {
        expect(ensureHTTPS('example.com/path')).toBe('https://example.com/path')
    })
})

describe('attachSearchParamsToUrl', () => {
    it('appends all params', () => {
        expect(
            attachSearchParamsToUrl('http://acme.gorgias.docker', {
                ref: 'internal',
                isTest: 'true',
            }),
        ).toBe('http://acme.gorgias.docker/?ref=internal&isTest=true')
    })

    it('keeps current search params', () => {
        expect(
            attachSearchParamsToUrl(
                'http://acme.gorgias.docker?current=isHere',
                {
                    ref: 'internal',
                    isTest: 'true',
                },
            ),
        ).toBe(
            'http://acme.gorgias.docker/?current=isHere&ref=internal&isTest=true',
        )
    })

    it('returns same URL if no params are provided', () => {
        expect(attachSearchParamsToUrl('http://acme.gorgias.docker', {})).toBe(
            'http://acme.gorgias.docker/',
        )

        expect(attachSearchParamsToUrl('http://acme.gorgias.docker')).toBe(
            'http://acme.gorgias.docker/',
        )
    })

    it('logs parse errors and returns the original URL', () => {
        const spy = vi
            .spyOn(global.console, 'error')
            .mockImplementation(() => {})

        expect(
            attachSearchParamsToUrl('/', {
                ref: 'internal',
                isTest: 'true',
            }),
        ).toBe('/')

        expect(spy).toHaveBeenCalledTimes(1)

        spy.mockRestore()
    })

    it('trims keys and overrides existing values', () => {
        expect(
            attachSearchParamsToUrl(
                'http://acme.gorgias.docker?ref=external&current=isHere',
                {
                    ' ref ': ' internal ',
                },
            ),
        ).toBe('http://acme.gorgias.docker/?ref=internal&current=isHere')
    })

    it('trims values', () => {
        expect(
            attachSearchParamsToUrl('http://acme.gorgias.docker', {
                ref: ' internal ',
                isTest: ' true ',
            }),
        ).toBe('http://acme.gorgias.docker/?ref=internal&isTest=true')
    })

    it('encodes values', () => {
        expect(
            attachSearchParamsToUrl('http://acme.gorgias.docker', {
                ref: 'internal',
                isTest: 'true',
                utm_campaign: '10% test',
            }),
        ).toBe(
            'http://acme.gorgias.docker/?ref=internal&isTest=true&utm_campaign=10%25%20test',
        )
    })
})

describe('encodeRFC3986URIComponent', () => {
    it.each([
        ['Lorem ipsum dolor sit amet', 'Lorem%20ipsum%20dolor%20sit%20amet'],
        ["Lorem!'()*ipsum", 'Lorem%21%27%28%29%2Aipsum'],
    ])('encodes %s to %s', (input, output) => {
        expect(encodeRFC3986URIComponent(input)).toBe(output)
    })
})
