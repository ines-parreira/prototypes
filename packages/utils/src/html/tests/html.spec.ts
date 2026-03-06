import { linkifyHtml, parseHtml, sanitizeHtmlDefault } from '../html'

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
