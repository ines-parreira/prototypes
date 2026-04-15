import { screen } from '@testing-library/react'
import { vi } from 'vitest'

import { render } from '../../../../tests/render.utils'
import { DisplayText } from './DisplayText'

const { highlightedTextMock } = vi.hoisted(() => ({
    highlightedTextMock: vi.fn(({ value }: { value: string }) => (
        <div>HighlightedText: {value}</div>
    )),
}))

vi.mock('./HighlightedText', () => ({
    HighlightedText: highlightedTextMock,
}))

describe('DisplayText', () => {
    beforeEach(() => {
        highlightedTextMock.mockClear()
    })

    it('delegates to HighlightedText when highlighted HTML is present', () => {
        render(
            <DisplayText
                value={{
                    text: 'fallback text',
                    highlightedHtml: '<em>Highlighted</em>',
                }}
            />,
        )

        expect(highlightedTextMock).toHaveBeenCalledTimes(1)
        expect(highlightedTextMock.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                value: '<em>Highlighted</em>',
            }),
        )
        expect(
            screen.getByText('HighlightedText: <em>Highlighted</em>'),
        ).toBeInTheDocument()
        expect(screen.queryByText('fallback text')).not.toBeInTheDocument()
    })

    it('falls back to plain text when no highlight exists', () => {
        render(
            <DisplayText
                value={{
                    text: 'Plain value',
                }}
            />,
        )

        expect(screen.getByText('Plain value')).toBeInTheDocument()
    })
})
