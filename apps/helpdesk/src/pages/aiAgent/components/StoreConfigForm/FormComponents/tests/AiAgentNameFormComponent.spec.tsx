import { render, screen } from '@testing-library/react'

import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'

import { AiAgentNameFormComponent } from '../AiAgentNameFormComponent'

describe('AiAgentNameFormComponent', () => {
    it('renders with the provided agent name', () => {
        render(
            <AiAgentNameFormComponent
                agentsName="Test Agent"
                agentsUserId={123}
            />,
        )
        expect(screen.getByTestId('ai-agent-name-text-area')).toHaveValue(
            'Test Agent',
        )
    })

    it('renders with the initial value if no agent name is provided', () => {
        render(<AiAgentNameFormComponent agentsUserId={123} />)
        expect(screen.getByTestId('ai-agent-name-text-area')).toHaveValue(
            INITIAL_FORM_VALUES.conversationBot.name,
        )
    })

    it('renders the footer info and link', () => {
        render(
            <AiAgentNameFormComponent
                agentsName="Test Agent"
                agentsUserId={456}
            />,
        )
        expect(
            screen.getByText(/This name will be used as sign-off/i),
        ).toBeInTheDocument()
        const link = screen.getByRole('link', { name: /users settings/i })
        expect(link).toHaveAttribute('href', '/app/settings/users/456')
    })

    it('input is disabled', () => {
        render(
            <AiAgentNameFormComponent
                agentsName="Test Agent"
                agentsUserId={123}
            />,
        )
        expect(screen.getByTestId('ai-agent-name-text-area')).toBeDisabled()
    })
})
