import React from 'react'

import { assumeMock } from '@repo/testing'
import { diffChars } from '@repo/utils'
import { render, screen } from '@testing-library/react'

import CharDiff from '../CharDiff'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    diffChars: jest.fn(),
}))

const diffCharsMock = assumeMock(diffChars)

describe('CharDiff', () => {
    const renderComponent = () => render(<CharDiff />)

    it('should return null when diffChars returns undefined', () => {
        diffCharsMock.mockReturnValue(undefined)

        const { container } = renderComponent()

        expect(container).toBeEmptyDOMElement()
    })

    it('should render diff tokens in order when diffChars returns a result', () => {
        diffCharsMock.mockReturnValue([
            { added: true, removed: false, value: 'a' },
            { added: false, removed: true, value: 'b' },
        ] as ReturnType<typeof diffChars>)

        renderComponent()

        const firstElement = screen.getByText('a')
        expect(firstElement).toBeInTheDocument()
        const secondElement = screen.getByText('b')
        expect(firstElement.nextElementSibling).toBe(secondElement)
    })

    it('should render added tokens with added class and removed token with removed class', () => {
        diffCharsMock.mockReturnValue([
            { added: true, removed: false, value: 'a' },
            { added: false, removed: true, value: 'b' },
        ] as ReturnType<typeof diffChars>)

        renderComponent()

        expect(screen.getByText('a')).toHaveClass('added')
        expect(screen.getByText('b')).toHaveClass('removed')
    })

    it('should render linebreaks correctly', () => {
        diffCharsMock.mockReturnValue([
            { added: true, removed: false, value: 'a\nb' },
            { added: false, removed: true, value: 'c\r\nd' },
            { added: false, removed: true, value: '\n' },
            { added: true, removed: false, value: '\n' },
        ] as ReturnType<typeof diffChars>)

        renderComponent()

        expect(screen.getByText(/a\sb/)).toBeInTheDocument()
        expect(screen.getByText(/c\sd/)).toBeInTheDocument()
        expect(screen.getAllByText('¶')).toHaveLength(2)
    })
})
