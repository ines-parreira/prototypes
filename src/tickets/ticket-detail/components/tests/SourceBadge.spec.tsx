import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SourceBadge } from '../SourceBadge'

describe('<SourceBadge />', () => {
    it('should render correct source badge', () => {
        const { rerender } = render(<SourceBadge channel="email" />)

        expect(screen.getByText('email')).toBeInTheDocument()

        rerender(<SourceBadge channel="chat" />)

        expect(screen.getByText('forum')).toBeInTheDocument()
    })

    it('should show a tooltip on hover', async () => {
        render(<SourceBadge channel="email" />)

        userEvent.hover(screen.getByText('email'))

        await waitFor(() => {
            expect(screen.getByText('Email')).toBeInTheDocument()
        })
    })
})
