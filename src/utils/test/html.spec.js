import jsdom from 'jsdom'

import {
    linkifyHtml,
    parseHtml,
    sanitizeHtmlDefault,
} from '../html'

describe('html util', () => {
    describe('parseHtml', () => {
        const {JSDOM} = jsdom
        const doc = '<!doctype><body></body>'
        const domOptions = {
            runScripts: 'dangerously',
            resources: 'usable',
        }
        let dom

        // failed expect in timeouts require try/catch and done.fail
        // https://github.com/facebook/jest/issues/3519
        function callback(done, body) {
            return () => {
                try {
                    body()
                    done()
                } catch (error) {
                    done.fail(error)
                }
            }
        }

        beforeEach(() => {
            dom = new JSDOM(doc, domOptions)
        })

        // skipped because jsdom does not fire onerror
        it.skip('should run inline event handlers', (done) => {
            const dom = new JSDOM('<img src="xss.jpg" onerror="window._xss=true;" />', domOptions)

            // // timeout required for jsdom to load the image
            setTimeout(callback(done, () => {
                expect(dom.window._xss).toBe(true)
            }), 100)
        })

        it('should not run inline event handlers', (done) => {
            const html = '<img src="xss.jpg" onerror="window._xss=true" />'
            parseHtml(html, dom.window)

            // timeout required for jsdom to load the image
            setTimeout(callback(done, () => {
                expect(dom.window._xss).toBe(undefined)
            }), 100)
        })

        it('should run script tags', () => {
            const dom = new JSDOM('<body><script>window._xss=true;</script></body>', domOptions)
            expect(dom.window._xss).toBe(true)
        })

        it('should not run script tags', (done) => {
            const html = '<script>window._xss=true<script/>'
            parseHtml(html, dom.window)

            setTimeout(callback(done, () => {
                expect(dom.window._xss).toBe(undefined)
            }), 100)
        })

        it('should fix invalid html structure', (done) => {
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
            const parsed = parseHtml(html, dom.window)

            setTimeout(callback(done, () => {
                expect(parsed.documentElement.innerHTML).toMatchSnapshot()
            }), 100)
        })

        it('should not remove invalid characters', (done) => {
            const html = 'Thank you <3 you are the best'
            const parsed = parseHtml(html, dom.window)

            setTimeout(callback(done, () => {
                expect(parsed.documentElement.innerHTML).toMatchSnapshot()
            }), 100)
        })

        it('should not remove quotes', (done) => {
            const html = 'these "quotes" here'
            const parsed = parseHtml(html, dom.window)

            setTimeout(callback(done, () => {
                expect(parsed.documentElement.innerHTML).toMatchSnapshot()
            }), 100)
        })
    })

    describe('linkifyHtml', () => {
        it('should linkify html with CDATA in head', () => {
            const html = '<head><style><![CDATA[body{}]]></style></head><body>Website gorgias.io</body>'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with CDATA in body', () => {
            const html = '<body><div><![CDATA[ - ]]></div>Website gorgias.io</body>'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify html with CDATA entities in body', () => {
            const html = '<!ENTITY ATT CDATA "Pizza">Website gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })

        it('should linkify nested links', () => {
            const html = 'gorgias.io Pizza<div>Pepperoni<h1>gorgias.io Margherita</h1></div>'
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
            const html = '<?xml version="1.0" encoding="utf-16"?><html>Pizza gorgias.io'
            expect(linkifyHtml(html)).toMatchSnapshot()
        })
    })

    describe('sanitizeHtmlDefault', () => {
        it('should return entry parameter if it\'s not a string', () => {
            expect(sanitizeHtmlDefault(undefined)).toBe(undefined)
            expect(sanitizeHtmlDefault(null)).toBe(null)
            expect(sanitizeHtmlDefault(12)).toBe(12)
        })

        it('should remove comments from html', () => {
            expect(sanitizeHtmlDefault('<p><!-->hey</p>')).toBe('<p>hey</p>')
            expect(sanitizeHtmlDefault('<p><!--[if IE9]>hey</p>')).toBe('<p></p>')
            expect(sanitizeHtmlDefault('<p><!--[if IE9]>hey<![endif]--></p>')).toBe('<p></p>')
            expect(sanitizeHtmlDefault('<p><!-- hola senor -->hey</p>')).toBe('<p>hey</p>')
            expect(sanitizeHtmlDefault('<p><!-- hola senor -->--> hey</p>')).toBe('<p>--&gt; hey</p>')
        })
        it('should remove all `o` - outlook tags', () => {
            expect(sanitizeHtmlDefault('<o:PixelsPerInch>96</o:PixelsPerInch>')).toBe('')
        })
    })
})
