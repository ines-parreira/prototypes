import jsdom, { BaseOptions } from 'jsdom'

import {
    focusElement,
    linkifyHtml,
    parseHtml,
    removeLinksFromHtml,
    sanitizeHtmlDefault,
    sanitizeHtmlForFacebookMessenger,
    sanitizeHtmlMinimal,
    textToHTML,
    trimHTML,
    unescapeQuoteEntities,
} from '../html'

describe('html util', () => {
    describe('parseHtml', () => {
        const { JSDOM } = jsdom
        const doc = '<!doctype><body></body>'
        const domOptions: BaseOptions = {
            runScripts: 'dangerously',
            resources: 'usable',
        }
        const htmlWithEvent =
            '<iframe src="/" onload="window._xss=true;"></iframe>'
        let dom: jsdom.JSDOM
        let domWindow: typeof window

        beforeEach(() => {
            dom = new JSDOM(doc, domOptions)
            domWindow = dom.window as unknown as typeof window
        })

        it('should run inline event handlers', (done) => {
            const dom = new JSDOM('<body></body>', domOptions)
            const div = dom.window.document.createElement('div')
            div.innerHTML = htmlWithEvent
            dom.window.document.body.appendChild(div)
            // timeout required for jsdom to trigger the event
            global.jestSetTimeout(
                () => {
                    expect(dom.window._xss).toBe(true)
                },
                100,
                done,
            )
        })

        it('should not run inline event handlers', (done) => {
            parseHtml(htmlWithEvent, domWindow)
            // timeout required for jsdom to trigger the event
            global.jestSetTimeout(
                () => {
                    expect(dom.window._xss).toBe(undefined)
                },
                100,
                done,
            )
        })

        it('should run script tags', () => {
            const dom = new JSDOM(
                '<body><script>window._xss=true;</script></body>',
                domOptions,
            )
            expect(dom.window._xss).toBe(true)
        })

        it('should not run script tags in parsed html', () => {
            const html = '<script>window._xss=true<script/>'
            parseHtml(html, domWindow)
            expect(dom.window._xss).toBe(undefined)
        })

        it('should fix invalid html structure', () => {
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
            const parsed = parseHtml(html, domWindow)
            if (parsed.documentElement == null) {
                throw new Error('parsed.documentElement is undefined')
            }
            expect(parsed.documentElement.innerHTML).toMatchSnapshot()
        })

        it('should not remove invalid characters', () => {
            const html = 'Thank you <3 you are the best'
            const parsed = parseHtml(html, domWindow)
            if (parsed.documentElement == null) {
                throw new Error('parsed.documentElement is undefined')
            }
            expect(parsed.documentElement.innerHTML).toMatchSnapshot()
        })

        it('should not remove quotes', () => {
            const html = 'these "quotes" here'
            const parsed = parseHtml(html, domWindow)
            if (parsed.documentElement == null) {
                throw new Error('parsed.documentElement is undefined')
            }
            expect(parsed.documentElement.innerHTML).toMatchSnapshot()
        })
    })

    describe('linkifyHtml', () => {
        it('should linkify html with CDATA in head', () => {
            const html =
                '<head><style><![CDATA[body{}]]></style></head><body>Website gorgias.io</body>'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with CDATA in body', () => {
            const html =
                '<body><div><![CDATA[ - ]]></div>Website gorgias.io</body>'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with CDATA entities in body', () => {
            const html = '<!ENTITY ATT CDATA "Pizza">Website gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify nested links', () => {
            const html =
                'gorgias.io Pizza<div>Pepperoni<h1>gorgias.io Margherita</h1></div>'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with script tags', () => {
            const html = '<script>alert();</script>gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with comments tags', () => {
            const html = '<!-- comment -->gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with bogus comments', () => {
            const html = '<!–– comment ––>gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with doctype', () => {
            const html = '<!doctype>gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('shoud linkify html with xml doctype', () => {
            const html =
                '<?xml version="1.0" encoding="utf-16"?><html>Pizza gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
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
            expect(sanitizeHtmlDefault('<p><!--[if IE9]>hey</p>')).toBe(
                '<p></p>',
            )
            expect(
                sanitizeHtmlDefault('<p><!--[if IE9]>hey<![endif]--></p>'),
            ).toBe('<p></p>')
            expect(sanitizeHtmlDefault('<p><!-- hola senor -->hey</p>')).toBe(
                '<p>hey</p>',
            )
            expect(
                sanitizeHtmlDefault('<p><!-- hola senor -->--> hey</p>'),
            ).toBe('<p>--&gt; hey</p>')
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
    })

    describe('sanitizeHtmlMinimal', () => {
        it("should return entry parameter if it's not a string", () => {
            expect(sanitizeHtmlMinimal(undefined as any)).toBe(undefined)
            expect(sanitizeHtmlMinimal(null as any)).toBe(null)
            expect(sanitizeHtmlMinimal(12 as any)).toBe(12)
        })
        it('should remove comments from html', () => {
            expect(sanitizeHtmlMinimal('<p><!-->hey</p>')).toBe('<p>hey</p>')
            expect(sanitizeHtmlMinimal('<p><!--[if IE9]>hey</p>')).toBe(
                '<p></p>',
            )
            expect(
                sanitizeHtmlMinimal('<p><!--[if IE9]>hey<![endif]--></p>'),
            ).toBe('<p></p>')
            expect(sanitizeHtmlMinimal('<p><!-- hola senor -->hey</p>')).toBe(
                '<p>hey</p>',
            )
            expect(
                sanitizeHtmlMinimal('<p><!-- hola senor -->--> hey</p>'),
            ).toBe('<p>--&gt; hey</p>')
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

            expect(
                sanitizeHtmlMinimal(inputHtml).replace(/\s+/g, ' ').trim(),
            ).toBe(expectedOutput.replace(/\s+/g, ' ').trim())
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
            expect(sanitizeHtmlDefault(undefined as any)).toBe(undefined)
            expect(sanitizeHtmlDefault(null as any)).toBe(null)
            expect(sanitizeHtmlDefault(12 as any)).toBe(12)
        })

        it('should remove comments from html', () => {
            expect(sanitizeHtmlDefault('<p><!-->hey</p>')).toBe('<p>hey</p>')
            expect(sanitizeHtmlDefault('<p><!--[if IE9]>hey</p>')).toBe(
                '<p></p>',
            )
            expect(
                sanitizeHtmlDefault('<p><!--[if IE9]>hey<![endif]--></p>'),
            ).toBe('<p></p>')
            expect(sanitizeHtmlDefault('<p><!-- hola senor -->hey</p>')).toBe(
                '<p>hey</p>',
            )
            expect(
                sanitizeHtmlDefault('<p><!-- hola senor -->--> hey</p>'),
            ).toBe('<p>--&gt; hey</p>')
        })

        it('should remove all `o` - outlook tags', () => {
            expect(
                sanitizeHtmlDefault('<o:PixelsPerInch>96</o:PixelsPerInch>'),
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

    describe('focusElement()', () => {
        it('should focus given element', (done) => {
            const focus = jest.fn()
            focusElement(() => ({ focus }) as unknown as HTMLElement)

            setTimeout(() => {
                expect(focus).toHaveBeenCalled()
                done()
            }, 0)
        })
    })

    describe('unescapeQuoteEntities()', () => {
        it('should unescape quote characters', () => {
            const input_html =
                'bla bla entities &amp;, &lt;, &gt;, &quot;, &#39;, then &#x27;, &apos;, &#x27;, &#39;, &quot;, &#x22;, &#34;'
            const expected =
                "bla bla entities &amp;, &lt;, &gt;, \", ', then ', ', ', ', \", \", \""

            expect(unescapeQuoteEntities(input_html)).toBe(expected)
        })
    })

    describe('textToHTML', () => {
        it.each([
            ['text', '<div>text</div>'],
            ['text\ntext2', '<div>text<br>text2</div>'],
            ['a\nb\n\n\nc\n', '<div>a<br>b<br><br><br>c<br></div>'],
        ])('should return text in html', (text, html) => {
            expect(textToHTML(text)).toBe(html)
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
            [
                '<div>text </div><div>text</div>',
                '<div>text </div><div>text</div>',
            ],
        ])('should return text in html', (html, trimmedHTML) => {
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
})
