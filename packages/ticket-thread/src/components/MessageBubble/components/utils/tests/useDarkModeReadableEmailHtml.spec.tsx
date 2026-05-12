import { renderHook } from '../../../../../tests/render.utils'
import {
    annotateDarkModeReadableEmailHtml,
    EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS,
    useDarkModeReadableEmailHtml,
} from '../useDarkModeReadableEmailHtml'

describe('annotateDarkModeReadableEmailHtml', () => {
    it('marks elements with inline painted background declarations', () => {
        expect(
            annotateDarkModeReadableEmailHtml(
                '<div style="background-color: #fff">Hello</div>',
            ),
        ).toContain(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
        expect(
            annotateDarkModeReadableEmailHtml(
                '<td style="background: white">Hello</td>',
            ),
        ).toContain(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
    })

    it('marks elements with bgcolor attributes', () => {
        expect(
            annotateDarkModeReadableEmailHtml(
                '<table bgcolor="#ffffff"></table>',
            ),
        ).toContain(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
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
