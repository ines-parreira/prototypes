import { render } from '@testing-library/react'

import { highlightFakeLinks } from './highlightFakeLinks'

describe('highlightFakeLinks', () => {
    it('should wrap URLs in a span with the provided className', () => {
        const text = 'Visit https://example.com for more info.'
        const className = 'fakeLink'
        const { container } = render(
            <div>{highlightFakeLinks(text, className)}</div>,
        )

        const link = container.querySelector('span.fakeLink')
        expect(link).toBeInTheDocument()
        expect(link).toHaveTextContent('https://example.com')
    })

    it('should return plain text when there are no URLs', () => {
        const text = 'This is a plain text message.'
        const className = 'fakeLink'
        const { container } = render(
            <div>{highlightFakeLinks(text, className)}</div>,
        )

        expect(container.querySelector('span.fakeLink')).not.toBeInTheDocument()
        expect(container).toHaveTextContent('This is a plain text message.')
    })

    it('should handle multiple URLs in the text', () => {
        const text = 'Check https://example.com and http://test.com'
        const className = 'fakeLink'
        const { container } = render(
            <div>{highlightFakeLinks(text, className)}</div>,
        )

        const links = container.querySelectorAll('span.fakeLink')
        expect(links).toHaveLength(2)
        expect(links[0]).toHaveTextContent('https://example.com')
        expect(links[1]).toHaveTextContent('http://test.com')
    })

    it('should preserve non-URL text between URLs', () => {
        const text =
            'Visit https://example.com and then http://test.com for details.'
        const className = 'fakeLink'
        const { container } = render(
            <div>{highlightFakeLinks(text, className)}</div>,
        )

        expect(container).toHaveTextContent('Visit ')
        expect(container).toHaveTextContent(' and then ')
        expect(container).toHaveTextContent(' for details.')
    })
})
