import {
    extractGorgiasVideoDivFromHtmlContent,
    focusElement,
    linkifyHtml,
    normalizeHtml,
    parseHtml,
    removeLinksFromHtml,
    sanitizeHtmlDefault,
    sanitizeHtmlForFacebookMessenger,
    sanitizeHtmlMinimal,
    trimHTML,
    unescapeAmpAndDollarEntities,
    unescapeQuoteEntities,
} from '../html'

describe('parseHtml', () => {
    afterEach(() => {
        delete (window as any)._xss
    })

    it('should not run inline event handlers', async () => {
        parseHtml('<iframe src="/" onload="window._xss=true;"></iframe>')
        await new Promise<void>((resolve) => setTimeout(resolve, 100))
        expect((window as any)._xss).toBeUndefined()
    })

    it('should not run script tags', () => {
        parseHtml('<script>window._xss=true</script>')
        expect((window as any)._xss).toBeUndefined()
    })

    it('should fix invalid html without throwing', () => {
        const html = `
                <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional //EN">
                <!doctype html>
                <html>
                    <head>
                        <title>Pepperoni</title>
                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    </head>
                    <table>
                        http://gorgias.io
                    <body>
                        <![CDATA[pizza]]>
                        <a href="https://gorgias.io">gorgias.io</a>
                    </body>
                </html>
        `
        const parsed = parseHtml(html)
        expect(parsed.documentElement).not.toBeNull()
        expect(parsed.documentElement?.textContent).toContain('gorgias.io')
    })

    it('should not remove invalid characters', () => {
        const parsed = parseHtml('Thank you <3 you are the best')
        expect(parsed.documentElement?.textContent).toContain('Thank you')
        expect(parsed.documentElement?.textContent).toContain(
            'you are the best',
        )
    })

    it('should not remove quotes', () => {
        const parsed = parseHtml('these "quotes" here')
        expect(parsed.documentElement?.textContent).toContain('"quotes"')
    })
})

describe('linkifyHtml', () => {
    it.each([
        [
            'CDATA in head',
            '<head><style><![CDATA[body{}]]></style></head><body>Website gorgias.io</body>',
        ],
        [
            'CDATA in body',
            '<body><div><![CDATA[ - ]]></div>Website gorgias.io</body>',
        ],
        [
            'CDATA entities in body',
            '<!ENTITY ATT CDATA "Pizza">Website gorgias.io',
        ],
        [
            'nested elements',
            'gorgias.io Pizza<div>Pepperoni<h1>gorgias.io Margherita</h1></div>',
        ],
        ['script tags', '<script>alert();</script>gorgias.io'],
        ['comment tags', '<!-- comment -->gorgias.io'],
        ['bogus comments', '<!–– comment ––>gorgias.io'],
        ['doctype', '<!doctype>gorgias.io'],
        [
            'xml doctype',
            '<?xml version="1.0" encoding="utf-16"?><html>Pizza gorgias.io',
        ],
    ])('should linkify URLs with %s', (_label, html) => {
        expect(linkifyHtml(html)).toContain('http://gorgias.io')
    })

    it('should add target="_blank" to URL links', () => {
        const result = linkifyHtml('Visit our website at www.example.com')
        expect(result).toContain('target="_blank"')
        expect(result).toContain('http://www.example.com')
    })

    it('should add target="_self" to email links', () => {
        const result = linkifyHtml('Contact us at support@example.com')
        expect(result).toContain('target="_self"')
        expect(result).toContain('mailto:support@example.com')
    })

    it('should add correct target attributes to mixed content with URLs and emails', () => {
        const result = linkifyHtml(
            'Visit www.example.com or email support@example.com',
        )
        expect(result).toContain('target="_blank"')
        expect(result).toContain('target="_self"')
        expect(result).toContain('http://www.example.com')
        expect(result).toContain('mailto:support@example.com')
    })
})

describe('sanitizeHtmlDefault', () => {
    it("should return entry parameter if it's not a string", () => {
        expect(sanitizeHtmlDefault(undefined as any)).toBe(undefined)
        expect(sanitizeHtmlDefault(null as any)).toBe(null)
        expect(sanitizeHtmlDefault(12 as any)).toBe(12)
    })

    it('should remove comments from html', () => {
        expect(sanitizeHtmlDefault('<p><!-->hey</p>')).toBe('<p>hey</p>')
        expect(sanitizeHtmlDefault('<p><!--[if IE9]>hey</p>')).toBe('<p></p>')
        expect(sanitizeHtmlDefault('<p><!--[if IE9]>hey<![endif]--></p>')).toBe(
            '<p></p>',
        )
        expect(sanitizeHtmlDefault('<p><!-- hola senor -->hey</p>')).toBe(
            '<p>hey</p>',
        )
        expect(sanitizeHtmlDefault('<p><!-- hola senor -->--> hey</p>')).toBe(
            '<p>--&gt; hey</p>',
        )
    })

    it('should remove all `o` - outlook tags', () => {
        expect(
            sanitizeHtmlDefault('<o:PixelsPerInch>96</o:PixelsPerInch>'),
        ).toBe('')
    })

    it("shouldn't remove valid table tags", () => {
        const tablehtml = `
                <table>
                    <caption>caption</caption>
                    <colgroup>
                        <col width="123"></col>
                    </colgroup>
                    <thead>
                        <tr><th>A</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>A</td></tr>
                    </tbody>
                    <tfoot>
                        <tr><td>A</td></tr>
                    </tfoot>
                </table>
        `
        expect(sanitizeHtmlDefault(tablehtml)).toBe(tablehtml)
    })

    it("shouldn't remove data URLs", () => {
        expect(sanitizeHtmlDefault('<img src="data:foo" />')).toBe(
            '<img src="data:foo" />',
        )
    })
})

describe('sanitizeHtmlMinimal', () => {
    it("should return entry parameter if it's not a string", () => {
        expect(sanitizeHtmlMinimal(undefined as any)).toBe(undefined)
        expect(sanitizeHtmlMinimal(null as any)).toBe(null)
        expect(sanitizeHtmlMinimal(12 as any)).toBe(12)
    })

    it('should remove comments from html', () => {
        expect(sanitizeHtmlMinimal('<p><!-->hey</p>')).toBe('<p>hey</p>')
        expect(sanitizeHtmlMinimal('<p><!--[if IE9]>hey</p>')).toBe('<p></p>')
        expect(sanitizeHtmlMinimal('<p><!--[if IE9]>hey<![endif]--></p>')).toBe(
            '<p></p>',
        )
        expect(sanitizeHtmlMinimal('<p><!-- hola senor -->hey</p>')).toBe(
            '<p>hey</p>',
        )
        expect(sanitizeHtmlMinimal('<p><!-- hola senor -->--> hey</p>')).toBe(
            '<p>--&gt; hey</p>',
        )
    })

    it('should remove multiple consecutive <br> tags and keeps only one', () => {
        const input = '<p>Hello</p><br><br><br><br><p>World</p>'
        const output = sanitizeHtmlMinimal(input)
        expect(output).toBe('<p>Hello</p><br /><p>World</p>')
    })

    it('should remove empty <p>&nbsp;</p> and <p>  </p> tags', () => {
        const input = '<p>Hi</p><p>&nbsp;</p><p> </p><p>There</p>'
        const output = sanitizeHtmlMinimal(input)
        expect(output).toBe('<p>Hi</p><p>There</p>')
    })

    it('should remove all `o` - outlook tags', () => {
        expect(
            sanitizeHtmlMinimal('<o:PixelsPerInch>96</o:PixelsPerInch>'),
        ).toBe('')
    })

    it('should keep only allowed tags: div, img, a, p, br, ul, li', () => {
        const inputHtml = `
                <div>
                    <h1>Heading</h1>
                    <p>This is a <a href="https://example.com">link</a>.</p>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                    <img src="image.jpg" onerror="alert('hack')" />
                    <script>alert('bad')</script>
                    <br>
                </div>
            `

        const expectedOutput = `
                <div>
                    <div>Heading</div>
                    <p>This is a <a href="https://example.com">link</a>.</p>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                    <img src="image.jpg" />
                    <br />
                </div>
            `.trim()

        expect(sanitizeHtmlMinimal(inputHtml).replace(/\s+/g, ' ').trim()).toBe(
            expectedOutput.replace(/\s+/g, ' ').trim(),
        )
    })

    it("shouldn't remove data URLs", () => {
        expect(sanitizeHtmlMinimal('<img src="data:foo" />')).toBe(
            '<img src="data:foo" />',
        )
    })

    it('should remove meta tags using exclusiveFilter', () => {
        const htmlWithMeta = `
                <meta charset="utf-8">
                <p>This is a test.</p>
            `
        expect(sanitizeHtmlMinimal(htmlWithMeta).trim()).toBe(
            '<p>This is a test.</p>',
        )
    })
})

describe('sanitizeHtmlForFacebookMessenger', () => {
    it("should return entry parameter if it's not a string", () => {
        expect(sanitizeHtmlForFacebookMessenger(undefined as any)).toBe(
            undefined,
        )
        expect(sanitizeHtmlForFacebookMessenger(null as any)).toBe(null)
        expect(sanitizeHtmlForFacebookMessenger(12 as any)).toBe(12)
    })

    it('should remove comments from html', () => {
        expect(sanitizeHtmlForFacebookMessenger('<p><!-->hey</p>')).toBe('hey')
        expect(
            sanitizeHtmlForFacebookMessenger('<p><!--[if IE9]>hey</p>'),
        ).toBe('')
        expect(
            sanitizeHtmlForFacebookMessenger(
                '<p><!--[if IE9]>hey<![endif]--></p>',
            ),
        ).toBe('')
        expect(
            sanitizeHtmlForFacebookMessenger('<p><!-- hola senor -->hey</p>'),
        ).toBe('hey')
        // Note: sanitizeHtmlForFacebookMessenger unescapes &gt; to > after sanitization
        expect(
            sanitizeHtmlForFacebookMessenger(
                '<p><!-- hola senor -->--> hey</p>',
            ),
        ).toBe('--> hey')
    })

    it('should remove all `o` - outlook tags', () => {
        expect(
            sanitizeHtmlForFacebookMessenger(
                '<o:PixelsPerInch>96</o:PixelsPerInch>',
            ),
        ).toBe('')
    })

    it.each([
        [
            {
                input_html: `<a href="https://this-is-a-test-url/">this is a test url</a>and should work`,
                expected_value: ` this is a test url: https://this-is-a-test-url/ and should work`,
            },
        ],
        [
            {
                input_html: `<a href="https://this-is-a-test-url/">https://this-is-a-test-url</a>and should work`,
                expected_value: ` https://this-is-a-test-url/ and should work`,
            },
        ],
        [
            {
                input_html: `
                    <div>Testing this amazing div</div>
                    <img src="https://this-is-a-test-url/and-this-is-the-image.png" alt="this is alt" />
                    <a href="https://this-is-a-test-url/">this is a test url</a>and should work
                    <br />
                    <br />
                    `,
                expected_value: `
                    <div>Testing this amazing div</div>
                    <img src="https://this-is-a-test-url/and-this-is-the-image.png" alt="this is alt" />
                     this is a test url: https://this-is-a-test-url/ and should work
                    <br />
                    <br />
                    `,
            },
        ],
        [
            {
                input_html: '<a href="https://messenger.com"> </a>',
                expected_value: ' https://messenger.com ',
            },
        ],
        [
            {
                input_html: '<a href="https://messenger.com"></a>',
                expected_value: ' https://messenger.com ',
            },
        ],
        [
            {
                input_html:
                    '<a href="https://messenger.com^">This is a link</a>',
                expected_value: ' This is a link: https://messenger.com^ ',
            },
        ],
        [
            {
                input_html:
                    '<a href="https://mess  enger.co  m ">This is a link with spaces inside URL</a>',
                expected_value:
                    ' This is a link with spaces inside URL: https://mess  enger.co  m  ',
            },
        ],
        [
            {
                input_html:
                    '<a Href="https://messenger.comfdasdas/!@#$%^&*()_-+=[]{}/\\`~§±;:,.<>">This is a link with special characters !@#$%^&*()_-+=[]{}/\\`~§±;:,.<></a>',
                expected_value:
                    ' This is a link with special characters !@#$%^&*()_-+=[]{}/\\`~§±;:,.<>: https://messenger.comfdasdas/!@#$%^&*()_-+=[]{}/\\`~§±;:,.<> ',
            },
        ],
    ])('should convert <a> tag', (testCase) => {
        expect(sanitizeHtmlForFacebookMessenger(testCase.input_html)).toBe(
            testCase.expected_value,
        )
    })
})

describe('focusElement', () => {
    it('should focus given element', async () => {
        const focus = vi.fn()
        focusElement(() => ({ focus }) as unknown as HTMLElement)

        await new Promise<void>((resolve) => setTimeout(resolve, 0))
        expect(focus).toHaveBeenCalled()
    })
})

describe('unescapeQuoteEntities', () => {
    it('should unescape quote characters', () => {
        const input_html =
            'bla bla entities &amp;, &lt;, &gt;, &quot;, &#39;, then &#x27;, &apos;, &#x27;, &#39;, &quot;, &#x22;, &#34;'
        const expected =
            "bla bla entities &amp;, &lt;, &gt;, \", ', then ', ', ', ', \", \", \""

        expect(unescapeQuoteEntities(input_html)).toBe(expected)
    })
})

describe('trimHTML', () => {
    it.each([
        ['<div><br></div>', ''],
        ['<br><div></div><br>', ''],
        ['<br><div>text text</div><br>', '<div>text text</div>'],
        ['<div>text text</div><div></div>', '<div>text text</div>'],
        ['   <div>text text</div>  ', '<div>text text</div>'],
        [
            '<div></br></div><div>text text</div><div><br></div>',
            '<div>text text</div>',
        ],
        [
            '<div><br></div><div>text </div><br><div>text text</div><div></div>',
            '<div>text </div><br><div>text text</div>',
        ],
        [
            '<div>text text</div><div><br></div><div>text</div><div><br></div><br><div><br></div><div><br></div>',
            '<div>text text</div><div><br></div><div>text</div>',
        ],
        [
            '<div></div><div>text</div><figure><img></figure><br>',
            '<div>text</div><figure><img></figure>',
        ],
        ['<div>text </div>', '<div>text</div>'],
        ['<div> text</div>', '<div>text</div>'],
        ['<div>text </div><div>text</div>', '<div>text </div><div>text</div>'],
    ])('should return trimmed html for %s', (html, trimmedHTML) => {
        expect(trimHTML(html)).toBe(trimmedHTML)
    })
})

describe('removeLinksFromHtml', () => {
    it('should remove links from HTML', () => {
        const input_html =
            'Hello world! This is a <a href="https://example.com">link</a>.'
        const expected = 'Hello world! This is a link.'

        expect(removeLinksFromHtml(input_html)).toEqual(expected)
    })

    it('should handle empty HTML', () => {
        const input_html = ''
        const expected = ''

        expect(removeLinksFromHtml(input_html)).toEqual(expected)
    })

    it('should handle HTML with no links', () => {
        const input_html = 'Hello world! <b>this is not a link</b>.'
        const expected = 'Hello world! <b>this is not a link</b>.'

        expect(removeLinksFromHtml(input_html)).toEqual(expected)
    })
})

describe('unescapeAmpAndDollarEntities', () => {
    it('should unescape ampersand and dollar entities', () => {
        const input_html =
            'bla bla entities &dollar;, &#36;, &#38;, &#x26;, &amp;, &lt;, &gt;, &quot;, &#39;, then &#x27;, &apos;, &#x27;, &#39;, &quot;, &#x22;, &#34;'
        const expected =
            'bla bla entities $, $, &, &, &, &lt;, &gt;, &quot;, &#39;, then &#x27;, &apos;, &#x27;, &#39;, &quot;, &#x22;, &#34;'

        expect(unescapeAmpAndDollarEntities(input_html)).toBe(expected)
    })
})

describe('normalizeHtml', () => {
    it('should return empty string for empty input', () => {
        expect(normalizeHtml('')).toBe('')
    })

    it('should normalize ampersand entities', () => {
        const input = '<div>&&&customer.email&&&</div>'
        const normalized = normalizeHtml(input)
        expect(normalized).toBe(
            '<p>&amp;&amp;&amp;customer.email&amp;&amp;&amp;</p>',
        )
    })

    it('should remove br tags that are the only child of a div', () => {
        const input1 = '<div><br /></div>'
        const input2 = '<div><br></div>'
        const normalized1 = normalizeHtml(input1)
        const normalized2 = normalizeHtml(input2)
        expect(normalized1).toBe('<p></p>')
        expect(normalized2).toBe('<p></p>')
        expect(normalized1).toBe(normalized2)
    })

    it('should not remove br tags that have siblings', () => {
        const input = '<div>Text<br />More text</div>'
        const normalized = normalizeHtml(input)
        expect(normalized).toContain('<br>')
    })

    it('should remove target attributes from links', () => {
        const input1 =
            '<a href="http://email.com" target="_blank">email.com</a>'
        const input2 = '<a href="http://email.com">email.com</a>'
        const normalized1 = normalizeHtml(input1)
        const normalized2 = normalizeHtml(input2)
        expect(normalized1).toBe('<a href="http://email.com">email.com</a>')
        expect(normalized2).toBe('<a href="http://email.com">email.com</a>')
        expect(normalized1).toBe(normalized2)
    })

    it('should remove trailing slashes from link hrefs', () => {
        const input1 = '<a href="http://email.com/">email.com</a>'
        const input2 = '<a href="http://email.com">email.com</a>'
        const normalized1 = normalizeHtml(input1)
        const normalized2 = normalizeHtml(input2)
        expect(normalized1).toBe('<a href="http://email.com">email.com</a>')
        expect(normalized2).toBe('<a href="http://email.com">email.com</a>')
        expect(normalized1).toBe(normalized2)
    })

    it('should produce consistent output when called multiple times', () => {
        const html =
            '<div>When a customer asks that they want to make more money, we should just give it to them.</div><div><br /></div><div>&&&customer.email&&& <a href="http://email.com/" target="_blank">email.com</a></div>'

        const normalized1 = normalizeHtml(html)
        const normalized2 = normalizeHtml(html)
        expect(normalized1).toBe(normalized2)

        const normalized3 = normalizeHtml(normalized1)
        expect(normalized3).toBe(normalized1)
    })

    it('should handle the real-world example from Draft.js editor', () => {
        const original =
            '<div>When a customer asks that they want to make more money, we should just give it to them.</div><div><br /></div><div>&&&customer.email&&& <a href="http://email.com/" target="_blank">email.com</a></div>'
        const rendered =
            '<div>When a customer asks that they want to make more money, we should just give it to them.</div><div></div><div>&amp;&amp;&amp;customer.email&amp;&amp;&amp; <a href="http://email.com">email.com</a></div>'

        const normalizedOriginal = normalizeHtml(original)
        const normalizedRendered = normalizeHtml(rendered)
        expect(normalizedOriginal).toBe(normalizedRendered)
    })

    it('should handle complex nested HTML', () => {
        const input = '<div><p>Test</p><div><br /></div></div>'
        const normalized = normalizeHtml(input)
        expect(typeof normalized).toBe('string')
        expect(normalized).toContain('Test')
        expect(normalized).toBe('<p><p>Test</p><p></p></p>')
    })

    it('should normalize <div> tags to <p> tags for consistent comparison', () => {
        const input1 = '<p>Hello World</p><p>Second paragraph</p>'
        const input2 = '<div>Hello World</div><div>Second paragraph</div>'
        const normalized1 = normalizeHtml(input1)
        const normalized2 = normalizeHtml(input2)
        expect(normalized1).toBe(normalized2)
        expect(normalized1).toBe('<p>Hello World</p><p>Second paragraph</p>')
    })

    it('should remove empty formatting tags that have no content', () => {
        const input1 = '<div></div>'
        const input2 = '<div><strong></strong></div>'
        const input3 = '<div><em></em></div>'
        const input4 = '<div><strong></strong><em></em><b></b></div>'

        const normalized1 = normalizeHtml(input1)
        const normalized2 = normalizeHtml(input2)
        const normalized3 = normalizeHtml(input3)
        const normalized4 = normalizeHtml(input4)

        expect(normalized1).toBe('<p></p>')
        expect(normalized2).toBe('<p></p>')
        expect(normalized3).toBe('<p></p>')
        expect(normalized4).toBe('<p></p>')
        expect(normalized1).toBe(normalized2)
        expect(normalized1).toBe(normalized3)
        expect(normalized1).toBe(normalized4)
    })
})

describe('extractGorgiasVideoDivFromHtmlContent', () => {
    it('should properly extract video HTML', () => {
        const dataset: {
            rawHtml: string
            expectedHtmlFinal: string
            expectedVideoUrls: string[]
        }[] = [
            {
                rawHtml: `<p>hello</p><a href="#">here</a>`,
                expectedHtmlFinal: `<p>hello</p><a href="#">here</a>`,
                expectedVideoUrls: [],
            },
            {
                rawHtml: `<p>hello<div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div></p><a href="#">here</a>`,
                expectedHtmlFinal: `<p>hello</p><a href="#">here</a>`,
                expectedVideoUrls: [
                    'https://www.youtube.com/watch?v=4sLFpe-xbhk',
                ],
            },
            {
                rawHtml: `<p>hello<div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div></p><a href="#">here</a><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk2" width="600"></div>`,
                expectedHtmlFinal: `<p>hello</p><a href="#">here</a>`,
                expectedVideoUrls: [
                    'https://www.youtube.com/watch?v=4sLFpe-xbhk',
                    'https://www.youtube.com/watch?v=4sLFpe-xbhk2',
                ],
            },
            // Extra space produced by draftjs because ending by a video should be removed.
            {
                rawHtml: `<p>hello</p><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div><div><br /></div>`,
                expectedHtmlFinal: `<p>hello</p>`,
                expectedVideoUrls: [
                    'https://www.youtube.com/watch?v=4sLFpe-xbhk',
                ],
            },
            // Extra space made on purpose by the agent (not ending by a video) should NOT be removed.
            {
                rawHtml: `<div>A</div><div><br /></div>`,
                expectedHtmlFinal: `<div>A</div><div><br /></div>`,
                expectedVideoUrls: [],
            },
        ]

        for (const data of dataset) {
            expect(extractGorgiasVideoDivFromHtmlContent(data.rawHtml)).toEqual(
                {
                    htmlCleaned: data.expectedHtmlFinal,
                    videoUrls: data.expectedVideoUrls,
                },
            )
        }
    })
})
