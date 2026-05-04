import { render, screen } from '@testing-library/react'

import { Subject } from './Subject'

describe('Subject', () => {
    it('renders children text', () => {
        render(<Subject>Ticket subject</Subject>)
        expect(screen.getByText('Ticket subject')).toBeInTheDocument()
    })

    it('renders inline without block layout', () => {
        const { container } = render(<Subject>inline text</Subject>)
        expect(container.firstChild).toBeInTheDocument()
        expect(screen.getByText('inline text')).toBeInTheDocument()
    })
})
