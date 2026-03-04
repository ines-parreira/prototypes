import { screen } from '@testing-library/react'

import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { TicketListItemAgentsViewing } from '../TicketListItemAgentsViewing'

vi.mock('@gorgias/axiom', async (importOriginal) => ({
    ...(await importOriginal()),
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

const agentWithName = { id: 1, name: 'Alice Smith', email: 'alice@example.com' }
const agentWithEmailOnly = { id: 2, name: undefined, email: 'bob@example.com' }
const agentWithName2 = {
    id: 3,
    name: 'Charlie Davis',
    email: 'charlie@example.com',
}

beforeEach(() => {
    testAppQueryClient.clear()
})

describe('TicketListItemAgentsViewing', () => {
    it('renders nothing when the agents list is empty', () => {
        const { container } = render(
            <TicketListItemAgentsViewing agents={[]} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('shows the agent name in the tooltip when a single named agent is viewing', () => {
        render(<TicketListItemAgentsViewing agents={[agentWithName]} />)
        expect(screen.getByText('Alice Smith is viewing')).toBeInTheDocument()
    })

    it('falls back to email in the tooltip when the agent has no name', () => {
        render(<TicketListItemAgentsViewing agents={[agentWithEmailOnly]} />)
        expect(
            screen.getByText('bob@example.com is viewing'),
        ).toBeInTheDocument()
    })

    it('uses email to derive avatar initials when agent has no name', () => {
        render(<TicketListItemAgentsViewing agents={[agentWithEmailOnly]} />)
        expect(screen.getByText('B')).toBeInTheDocument()
    })

    it('shows a multiple-agents header and lists each name when more than one agent is viewing', () => {
        render(
            <TicketListItemAgentsViewing
                agents={[agentWithName, agentWithName2]}
            />,
        )
        expect(
            screen.getByText('Multiple agents are viewing'),
        ).toBeInTheDocument()
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
        expect(screen.getByText('Charlie Davis')).toBeInTheDocument()
    })

    it('falls back to email in the multi-agent tooltip list when agent has no name', () => {
        render(
            <TicketListItemAgentsViewing
                agents={[agentWithName, agentWithEmailOnly]}
            />,
        )
        expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })
})
