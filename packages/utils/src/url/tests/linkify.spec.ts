import { linkify } from '../linkify'

describe('linkify', () => {
    it('matches a URL with a common TLD', () => {
        const matches = linkify.match('Visit example.com today')
        expect(matches).toHaveLength(1)
        expect(matches![0].url).toBe('http://example.com')
    })

    it('matches a full URL with protocol', () => {
        const matches = linkify.match('Go to https://example.com/path')
        expect(matches).toHaveLength(1)
        expect(matches![0].url).toBe('https://example.com/path')
    })

    it('matches multiple URLs in a string', () => {
        const matches = linkify.match(
            'Check example.com and test.org for details',
        )
        expect(matches).toHaveLength(2)
    })

    it('returns null for text without URLs', () => {
        expect(linkify.match('no links here')).toBeNull()
    })

    it('matches URLs with configured TLDs like .io and .eu', () => {
        expect(linkify.match('visit site.io')).toHaveLength(1)
        expect(linkify.match('visit site.eu')).toHaveLength(1)
    })
})
