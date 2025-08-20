import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import { TruncatedText } from './TruncatedText'

describe('TruncatedText', () => {
    it('should render text without tooltip when not truncated', () => {
        render(<TruncatedText text="Short text" />)

        expect(screen.getByText('Short text')).toBeInTheDocument()
    })

    it('should render text with correct className', () => {
        render(<TruncatedText text="Test text" className="custom-class" />)

        const textElement = screen.getByText('Test text')
        expect(textElement).toHaveClass('custom-class')
    })

    it('should pass text prop to trigger re-calculation', async () => {
        const { rerender } = render(<TruncatedText text="Initial text" />)

        expect(screen.getByText('Initial text')).toBeInTheDocument()

        rerender(<TruncatedText text="Updated text" />)

        await waitFor(() => {
            expect(screen.getByText('Updated text')).toBeInTheDocument()
        })
    })
    it.each([
        ['Hello.world#123', 'truncated-text-hello-world-123'],
        ['User[admin].profile', 'truncated-text-user-admin-profile'],
        ['homegrowncannabisco.com', 'truncated-text-homegrowncannabisco-com'],
    ])(
        'should render text with correct id when the text contains special characters',
        (text, id) => {
            render(<TruncatedText text={text} />)
            expect(screen.getByText(text)).toHaveAttribute('id', id)
        },
    )
})
