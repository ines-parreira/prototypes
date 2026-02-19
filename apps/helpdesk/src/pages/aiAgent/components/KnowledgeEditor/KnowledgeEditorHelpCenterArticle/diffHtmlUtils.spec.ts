import { computeSafeHtmlDiff } from './diffHtmlUtils'

function hasUnpairedSurrogate(value: string): boolean {
    for (let index = 0; index < value.length; index += 1) {
        const codeUnit = value.charCodeAt(index)

        if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
            const nextCodeUnit = value.charCodeAt(index + 1)
            if (!(nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff)) {
                return true
            }
            index += 1
            continue
        }

        if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
            return true
        }
    }

    return false
}

function getStandaloneWhitespaceOnlyMarkersWithoutBreak(diffHtml: string) {
    const doc = new DOMParser().parseFromString(diffHtml, 'text/html')

    return Array.from(doc.querySelectorAll('ins, del')).filter((marker) => {
        const normalizedText = marker.textContent
            ?.replace(/\u00A0/g, ' ')
            .trim()
        const parent = marker.parentElement

        if (!parent) {
            return false
        }

        const hasStandaloneContainer = Array.from(parent.childNodes).every(
            (node) => {
                if (node === marker) {
                    return true
                }

                if (node.nodeType !== Node.TEXT_NODE) {
                    return false
                }

                return (
                    (node.textContent ?? '').replace(/\u00A0/g, ' ').trim() ===
                    ''
                )
            },
        )

        return (
            hasStandaloneContainer &&
            normalizedText === '' &&
            !marker.querySelector('br')
        )
    })
}

describe('computeSafeHtmlDiff', () => {
    it('preserves emoji diff rendering without introducing broken surrogate pairs', () => {
        const oldContent = `<p>Status ${String.fromCodePoint(0x1f604)}</p>`
        const newContent = `<p>Status ${String.fromCodePoint(0x1f603)}</p>`

        const diffHtml = computeSafeHtmlDiff(oldContent, newContent)

        expect(diffHtml).toContain(String.fromCodePoint(0x1f604))
        expect(diffHtml).toContain(String.fromCodePoint(0x1f603))
        expect(diffHtml).not.toContain('\uFFFD')
        expect(hasUnpairedSurrogate(diffHtml)).toBe(false)
    })

    it('converts standalone whitespace-only markers into explicit break markers', () => {
        const oldContent = '<p>Line one</p><p>&nbsp;</p><p>Line two</p>'
        const newContent = '<p>Line one</p><p>Line two</p>'

        const diffHtml = computeSafeHtmlDiff(oldContent, newContent)
        const doc = new DOMParser().parseFromString(diffHtml, 'text/html')

        expect(
            doc.querySelector(
                'ins.diff-break-marker br, del.diff-break-marker br',
            ),
        ).not.toBeNull()
        expect(
            getStandaloneWhitespaceOnlyMarkersWithoutBreak(diffHtml),
        ).toHaveLength(0)
    })

    it('does not normalize inline whitespace markers used for spacing changes', () => {
        const oldContent = '<div>great user  experience</div>'
        const newContent = '<div>great user experience</div>'

        const diffHtml = computeSafeHtmlDiff(oldContent, newContent)
        const doc = new DOMParser().parseFromString(diffHtml, 'text/html')

        expect(doc.querySelector('ins.diff-break-marker')).toBeNull()
        expect(doc.querySelector('del.diff-break-marker')).toBeNull()
        expect(doc.querySelector('del.diffmod, ins.diffmod')).not.toBeNull()
    })

    it('handles published vs draft content with nested lists, variables, links, and emoji', () => {
        const emoji = String.fromCodePoint(0x1f604)
        const updatedEmoji = String.fromCodePoint(0x1f605)
        const oldContent = `<div>Vlad Test Drafts pt.2 hola, is this a great user  experience?ubiubiubu</div><div><br /></div><div>Now it is time to add some actions and variables.$$$01HWACSKEC868PRZ47TY5K5F0X$$$</div><div><br /></div><div>&&&customer.orders_count&&&$$$01JA8XAW0G7T5Y1AETJRPPPPQN$$$</div><div><br /></div><ul><li>And <strong>now I can also add some bolds and some italic: </strong><em>hello world, </em>${emoji}</li><li><a href="https://google.com/" target="_blank">google</a></li><li>another edit</li></ul><figure style="display:inline-block;margin:0"><hr /></figure><div><br /></div>`
        const newContent = `<div>Vlad Test Drafts pt.2 hola, is this a great user experience?ubiubiubu</div><div>Now it is time to add some actions and variables.$$$01HWACSKEC868PRZ47TY5K5F0X$$$</div><div><br /></div><div>&&&customer.orders_count&&&$$$01JA8XAW0G7T5Y1AETJRPPPPQN$$$</div><div><br /></div><ul><li>And <strong>now I can also add some bolds and some italic: </strong><em>hello world, </em>${updatedEmoji}</li><li><a href="https://google.com/" target="_blank">google</a></li><li>another edit updated</li></ul><figure style="display:inline-block;margin:0"><hr /></figure><div><br /></div><div>Do not share the available products with the customer.</div>`

        const diffHtml = computeSafeHtmlDiff(oldContent, newContent)

        expect(diffHtml).toContain(emoji)
        expect(diffHtml).toContain(updatedEmoji)
        expect(diffHtml).not.toContain('\uFFFD')
        expect(hasUnpairedSurrogate(diffHtml)).toBe(false)
        expect(
            getStandaloneWhitespaceOnlyMarkersWithoutBreak(diffHtml),
        ).toHaveLength(0)
    })
})
