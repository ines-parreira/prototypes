import { sanitizeHtmlDefault } from './html'

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
