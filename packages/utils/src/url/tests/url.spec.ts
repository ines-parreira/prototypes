import { ensureHTTPS } from '../url'

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
    })

    it('prepends https:// to bare domains', () => {
        expect(ensureHTTPS('example.com')).toBe('https://example.com')
    })

    it('prepends https:// to bare domains with paths', () => {
        expect(ensureHTTPS('example.com/path')).toBe('https://example.com/path')
    })
})
