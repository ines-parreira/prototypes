import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Emoji } from 'emoji-mart'

import { TicketAssigneeTeam, TicketAssigneeUser } from '@gorgias/helpdesk-types'
import { Avatar } from '@gorgias/merchant-ui-kit'

import { useFlag } from 'core/flags'

import { TicketAssignee } from '../TicketAssignee'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Avatar: jest.fn(() => <div />),
}))

jest.mock('emoji-mart', () => ({
    Emoji: jest.fn(() => <div />),
}))

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/tickets/detail/components/TicketMessages/Avatar', () => ({
    Avatar: () => <div>New Avatar</div>,
}))

describe('TicketAssignee', () => {
    const mockAssignedAgent = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        meta: {
            profile_picture_url: 'https://example.com/avatar.jpg',
        },
    } as TicketAssigneeUser

    const mockAssignedTeam: TicketAssigneeTeam = {
        id: 1,
        name: 'Support Team',
        decoration: {
            emoji: '👥',
            color: '#000000',
        },
    }

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('renders agent name and avatar when agent and team are assigned', () => {
        render(
            <TicketAssignee
                assignedAgent={mockAssignedAgent}
                assignedTeam={mockAssignedTeam}
            />,
        )

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'John Doe',
                url: 'https://example.com/avatar.jpg',
                shape: 'square',
                size: 'sm',
            }),
            expect.anything(),
        )
    })

    it('renders the new avatar when the ticket thread revamp is enabled', () => {
        useFlagMock.mockReturnValue(true)
        render(
            <TicketAssignee
                assignedAgent={mockAssignedAgent}
                assignedTeam={mockAssignedTeam}
            />,
        )

        expect(screen.getByText('New Avatar')).toBeInTheDocument()
    })

    it('renders agent email when name is not available', () => {
        const agentWithoutName = {
            ...mockAssignedAgent,
            name: '',
        } as TicketAssigneeUser

        render(
            <TicketAssignee
                assignedAgent={agentWithoutName}
                assignedTeam={mockAssignedTeam}
            />,
        )

        expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('renders "Unassigned" when neither agent nor team are assigned', () => {
        render(<TicketAssignee assignedAgent={null} assignedTeam={null} />)

        expect(screen.getByText('Unassigned')).toBeInTheDocument()
        expect(Avatar).not.toHaveBeenCalled()
        expect(Emoji).not.toHaveBeenCalled()
    })

    it('renders team emoji and name when only team is assigned', () => {
        render(
            <TicketAssignee
                assignedAgent={null}
                assignedTeam={mockAssignedTeam}
            />,
        )

        expect(screen.getByText('Support Team')).toBeInTheDocument()
        expect(Emoji).toHaveBeenCalledWith(
            expect.objectContaining({
                emoji: '👥',
                size: 20,
            }),
            expect.anything(),
        )
    })

    it('renders avatar when team has no emoji', () => {
        const teamWithoutEmoji: TicketAssigneeTeam = {
            ...mockAssignedTeam,
            decoration: {
                emoji: '',
                color: '#000000',
            },
        }

        render(
            <TicketAssignee
                assignedAgent={null}
                assignedTeam={teamWithoutEmoji}
            />,
        )

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Support Team',
                shape: 'square',
                size: 'sm',
            }),
            expect.anything(),
        )
    })
})
