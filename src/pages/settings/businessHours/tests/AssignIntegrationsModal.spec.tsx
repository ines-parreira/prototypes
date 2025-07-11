import { render, screen } from '@testing-library/react'

import AssignIntegrationsModal from '../AssignIntegrationsModal'

describe('AssignIntegrationsModal', () => {
    it('should render content when isOpen is true', () => {
        render(<AssignIntegrationsModal isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText('Assign Integrations')).toBeInTheDocument()
    })

    it('should not render content when isOpen is false', () => {
        render(<AssignIntegrationsModal isOpen={false} onClose={jest.fn()} />)

        expect(
            screen.queryByText('Assign Integrations'),
        ).not.toBeInTheDocument()
    })
})
