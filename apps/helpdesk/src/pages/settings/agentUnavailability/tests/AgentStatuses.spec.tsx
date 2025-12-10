import { render, screen } from '@testing-library/react'

import AgentStatuses from '../AgentStatuses'

describe('AgentStatuses', () => {
    it('should render the page header', () => {
        render(<AgentStatuses />)

        expect(
            screen.getByRole('heading', { name: /agent statuses/i }),
        ).toBeInTheDocument()
    })

    it('should render the page content', () => {
        render(<AgentStatuses />)

        expect(screen.getByText('Agent statuses page')).toBeInTheDocument()
    })
})
