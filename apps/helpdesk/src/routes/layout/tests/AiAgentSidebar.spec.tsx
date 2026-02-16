import { render, screen } from '@testing-library/react'

import { AiAgentSidebar } from '../sidebars/AiAgentSidebar'

jest.mock('pages/aiAgent/components/AiAgentNavbar/AiAgentNavbar', () => ({
    AiAgentNavbar: () => <div>AiAgentNavbar</div>,
}))

describe('AiAgentSidebar', () => {
    it('should render AiAgentNavbar component', () => {
        render(<AiAgentSidebar />)
        const navbar = screen.getByText('AiAgentNavbar')
        expect(navbar).toBeInTheDocument()
    })
})
