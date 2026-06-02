import { normalizeLegacyContent, stabilize } from './normalizeLegacyContent'

describe('normalizeLegacyContent', () => {
    it('returns an empty string for null, undefined or empty input', () => {
        expect(normalizeLegacyContent(null)).toBe('')
        expect(normalizeLegacyContent(undefined)).toBe('')
        expect(normalizeLegacyContent('')).toBe('')
    })

    it('leaves content that already contains HTML untouched', () => {
        const html = '<p>already <strong>html</strong></p>'
        expect(normalizeLegacyContent(html)).toBe(html)
    })

    it('wraps a single line of plain text in a block', () => {
        expect(normalizeLegacyContent('Hello world')).toBe(
            '<div>Hello world</div>',
        )
    })

    it('produces one block per line, with empty lines preserved as <br/>', () => {
        expect(normalizeLegacyContent('Step 1\n\nStep 2')).toBe(
            '<div>Step 1</div><div><br /></div><div>Step 2</div>',
        )
    })

    it('keeps Draft semantics: each \\n becomes its own block', () => {
        expect(normalizeLegacyContent('Step 1\nDetails')).toBe(
            '<div>Step 1</div><div>Details</div>',
        )
    })

    it('escapes angle brackets in plain text', () => {
        expect(normalizeLegacyContent('5 < 10 > 3')).toBe(
            '<div>5 &lt; 10 &gt; 3</div>',
        )
    })

    it('treats placeholder-like tokens in plain text as plain text (not HTML)', () => {
        expect(normalizeLegacyContent('Use the <foo> placeholder')).toBe(
            '<div>Use the &lt;foo&gt; placeholder</div>',
        )
        expect(normalizeLegacyContent('Customer name: <name>')).toBe(
            '<div>Customer name: &lt;name&gt;</div>',
        )
    })
})

describe('stabilize', () => {
    it('returns an empty string for empty input', () => {
        expect(stabilize('')).toBe('')
    })

    it('is idempotent: running the result through stabilize yields the same string', () => {
        const result = stabilize('<p>Hello <strong>world</strong></p>')
        expect(stabilize(result)).toBe(result)
    })

    it('preserves visible content through the Draft.js round-trip', () => {
        expect(stabilize('<p>Hello</p>')).toContain('Hello')
    })
})
