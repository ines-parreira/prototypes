import jsdom from 'jsdom'

import {
    focusElement,
    linkifyHtml,
    parseHtml,
    sanitizeHtmlDefault,
    sanitizeHtmlForFacebookMessenger,
} from '../html'

describe('html util', () => {
    describe('parseHtml', () => {
        const {JSDOM} = jsdom
        const doc = '<!doctype><body></body>'
        const domOptions = {
            runScripts: 'dangerously',
            resources: 'usable',
        } as any
        const htmlWithEvent =
            '<iframe src="/" onload="window._xss=true;"></iframe>'
        let dom: jsdom.JSDOM
        let domWindow: typeof window

        beforeEach(() => {
            dom = new JSDOM(doc, domOptions)
            domWindow = (dom.window as unknown) as typeof window
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
                done
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
                done
            )
        })

        it('should run script tags', () => {
            const dom = new JSDOM(
                '<body><script>window._xss=true;</script></body>',
                domOptions
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
                '<p></p>'
            )
            expect(
                sanitizeHtmlDefault('<p><!--[if IE9]>hey<![endif]--></p>')
            ).toBe('<p></p>')
            expect(sanitizeHtmlDefault('<p><!-- hola senor -->hey</p>')).toBe(
                '<p>hey</p>'
            )
            expect(
                sanitizeHtmlDefault('<p><!-- hola senor -->--> hey</p>')
            ).toBe('<p>--&gt; hey</p>')
        })
        it('should remove all `o` - outlook tags', () => {
            expect(
                sanitizeHtmlDefault('<o:PixelsPerInch>96</o:PixelsPerInch>')
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

    describe('sanitizeHtmlForFacebookMessenger', () => {
        it("should return entry parameter if it's not a string", () => {
            expect(sanitizeHtmlDefault(undefined as any)).toBe(undefined)
            expect(sanitizeHtmlDefault(null as any)).toBe(null)
            expect(sanitizeHtmlDefault(12 as any)).toBe(12)
        })

        it('should remove comments from html', () => {
            expect(sanitizeHtmlDefault('<p><!-->hey</p>')).toBe('<p>hey</p>')
            expect(sanitizeHtmlDefault('<p><!--[if IE9]>hey</p>')).toBe(
                '<p></p>'
            )
            expect(
                sanitizeHtmlDefault('<p><!--[if IE9]>hey<![endif]--></p>')
            ).toBe('<p></p>')
            expect(sanitizeHtmlDefault('<p><!-- hola senor -->hey</p>')).toBe(
                '<p>hey</p>'
            )
            expect(
                sanitizeHtmlDefault('<p><!-- hola senor -->--> hey</p>')
            ).toBe('<p>--&gt; hey</p>')
        })

        it('should remove all `o` - outlook tags', () => {
            expect(
                sanitizeHtmlDefault('<o:PixelsPerInch>96</o:PixelsPerInch>')
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
                testCase.expected_value
            )
        })
    })

    describe('focusElement()', () => {
        it('should focus given element', (done) => {
            const focus = jest.fn()
            focusElement(() => (({focus} as unknown) as HTMLElement))

            setTimeout(() => {
                expect(focus).toHaveBeenCalled()
                done()
            }, 0)
        })
    })
})
