import { renderHook } from '../../../../../../tests/render.utils'
import {
    annotateDarkModeReadableEmailHtml,
    EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
    EMAIL_ELEMENT_WITH_AUTHORED_DARK_BACKGROUND_CLASS,
    EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
    useDarkModeReadableEmailHtml,
} from '../useDarkModeReadableEmailHtml'

describe('annotateDarkModeReadableEmailHtml', () => {
    it('marks elements with inline painted background declarations', () => {
        const hexBackground = annotateDarkModeReadableEmailHtml(
            '<div style="background-color: #fff">Hello</div>',
        )
        const namedBackground = annotateDarkModeReadableEmailHtml(
            '<td style="background: white">Hello</td>',
        )

        expect(hexBackground).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(hexBackground).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
        expect(namedBackground).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(namedBackground).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
    })

    it('marks elements with bgcolor attributes', () => {
        const annotatedHtml = annotateDarkModeReadableEmailHtml(
            '<table bgcolor="#ffffff"></table>',
        )

        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
    })

    it('marks dark authored backgrounds separately from light backgrounds', () => {
        const annotatedHtml = annotateDarkModeReadableEmailHtml(
            '<a style="background:#413d3c">Timbermill</a>',
        )

        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_DARK_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).not.toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
    })

    it.each([
        ['short hex', '<div style="background:#fff">Hello</div>'],
        [
            'long hex with alpha',
            '<div style="background-color:#ffffff80">Hello</div>',
        ],
        [
            'comma rgb',
            '<div style="background-color:rgb(255, 255, 255)">Hello</div>',
        ],
        [
            'space rgb with slash alpha',
            '<div style="background-color:rgb(255 255 255 / 50%)">Hello</div>',
        ],
        [
            'percentage rgb',
            '<div style="background-color:rgb(100% 100% 100%)">Hello</div>',
        ],
        ['named color', '<div style="background:silver">Hello</div>'],
    ])('marks %s light backgrounds', (_label, html) => {
        const annotatedHtml = annotateDarkModeReadableEmailHtml(html)

        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).not.toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_DARK_BACKGROUND_CLASS,
        )
    })

    it.each([
        ['short hex', '<div style="background:#000">Hello</div>'],
        ['long hex', '<div style="background-color:#111111">Hello</div>'],
        [
            'comma rgba',
            '<div style="background-color:rgba(0, 0, 0, 0.7)">Hello</div>',
        ],
        [
            'space rgb',
            '<div style="background-color:rgb(10 10 10)">Hello</div>',
        ],
        ['named color', '<div style="background:black">Hello</div>'],
    ])('marks %s dark backgrounds', (_label, html) => {
        const annotatedHtml = annotateDarkModeReadableEmailHtml(html)

        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_DARK_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).not.toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
    })

    it('does not add a readable color class for unparseable authored backgrounds', () => {
        const annotatedHtml = annotateDarkModeReadableEmailHtml(
            '<div style="background:url(hero.png)">Hello</div>',
        )

        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).not.toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).not.toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_DARK_BACKGROUND_CLASS,
        )
    })

    it('marks light authored backgrounds around unstyled table-cell text', () => {
        const annotatedHtml = annotateDarkModeReadableEmailHtml(
            '<table style="background:#fff"><tbody><tr><th>Thanks for your order</th></tr></tbody></table>',
        )

        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        expect(annotatedHtml).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_LIGHT_BACKGROUND_CLASS,
        )
    })

    it('does not mark text color only containers', () => {
        expect(
            annotateDarkModeReadableEmailHtml(
                '<div style="color: rgb(33, 33, 33)">Hello</div>',
            ),
        ).not.toContain(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
    })

    it('does not mark values that do not paint a background', () => {
        expect(
            annotateDarkModeReadableEmailHtml(
                '<div style="background-color: transparent">Hello</div>',
            ),
        ).not.toContain(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
        expect(
            annotateDarkModeReadableEmailHtml(
                '<div style="background: none">Hello</div>',
            ),
        ).not.toContain(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
        expect(
            annotateDarkModeReadableEmailHtml(
                '<table bgcolor="transparent"></table>',
            ),
        ).not.toContain(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
    })
})

describe('useDarkModeReadableEmailHtml', () => {
    it('memoizes the html post-processing based on the html string', () => {
        const createElement = vi.spyOn(document, 'createElement')
        const html = '<div style="background-color: #fff">Hello</div>'

        const { rerender, result } = renderHook(
            ({ content }) => useDarkModeReadableEmailHtml(content),
            { initialProps: { content: html } },
        )

        expect(result.current).toContain(
            EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
        )
        createElement.mockClear()

        rerender({ content: html })

        expect(createElement).not.toHaveBeenCalled()

        rerender({
            content: '<div style="background-color: #000">Hello</div>',
        })

        expect(createElement).toHaveBeenCalled()
    })
})
