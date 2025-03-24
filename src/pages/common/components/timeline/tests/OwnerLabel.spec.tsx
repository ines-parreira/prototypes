import { render, screen } from '@testing-library/react'

import { OwnerLabel } from '../OwnerLabel'

describe('<OwnerLabel />', () => {
    it('should render correct owner label', () => {
        const { rerender } = render(
            <OwnerLabel type="agent" owner="John Doe" />,
        )

        expect(screen.getByText('John Doe')).toBeInTheDocument()

        rerender(<OwnerLabel type="team" owner="Team A" />)

        expect(screen.getByText('Team A')).toBeInTheDocument()
    })

    it('should render defaults when no owner is set', () => {
        const { rerender } = render(<OwnerLabel type="agent" />)
        render(<OwnerLabel type="team" />)

        expect(screen.getByText('Unassigned')).toBeInTheDocument()

        rerender(<OwnerLabel type="agent" />)
        expect(screen.getByText('No team assigned')).toBeInTheDocument()
    })

    it('should render warning class when no owner is set for agent', () => {
        render(<OwnerLabel type="agent" />)

        expect(screen.getByText('Unassigned').parentElement).toHaveClass(
            'warning',
        )
    })

    it('should render correct icon for agent', () => {
        render(<OwnerLabel type="agent" owner="John Doe" />)

        expect(screen.getByText('account_circle')).toBeInTheDocument()
    })
})
