import { render } from '@repo/testing'

import { HighlightedText } from './HighlightedText'

describe('HighlightedText', () => {
    it('renders the original text when no query is provided', () => {
        const { container } = render(
            <HighlightedText text="Reship order" query="" />,
        )
        expect(container.textContent).toBe('Reship order')
        expect(container.querySelector('mark')).toBeNull()
    })

    it('wraps the matched substring in a mark element', () => {
        const { container } = render(
            <HighlightedText text="Reship order" query="ship" />,
        )
        const marks = container.querySelectorAll('mark')
        expect(marks).toHaveLength(1)
        expect(marks[0]).toHaveTextContent('ship')
        expect(container.textContent).toBe('Reship order')
    })

    it('matches case-insensitively while preserving original casing', () => {
        const { container } = render(
            <HighlightedText text="ShipStation" query="ship" />,
        )
        const marks = container.querySelectorAll('mark')
        expect(marks).toHaveLength(1)
        expect(marks[0]).toHaveTextContent('Ship')
    })

    it('highlights every occurrence of the query', () => {
        const { container } = render(
            <HighlightedText text="Reship the shipping address" query="ship" />,
        )
        const marks = container.querySelectorAll('mark')
        expect(marks).toHaveLength(2)
    })

    it('renders the original text when there is no match', () => {
        const { container } = render(
            <HighlightedText text="Cancel order" query="ship" />,
        )
        expect(container.querySelector('mark')).toBeNull()
        expect(container.textContent).toBe('Cancel order')
    })
})
