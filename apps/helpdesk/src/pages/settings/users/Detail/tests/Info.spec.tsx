import { userEvent } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { Info } from '../Info'
import { AgentState } from '../types'

const mockedInviteAgent = jest.fn(() => Promise.resolve(true))
jest.mock('hooks/agents/useInviteAgent', () => ({
    useInviteAgent: () => ({
        mutate: mockedInviteAgent,
        isLoading: false,
    }),
}))

const props = {
    name: 'M. Love',
    email: 'mister@love.com',
    isEdit: false,
    agentId: 1,
    isViewingAccountOwner: false,
    isAccountOwner: false,
    isInternal: false,
    setAgentState: jest.fn((cb: (param: AgentState) => AgentState) => cb),
}

describe('Info', () => {
    it('should call setAgentState when editing', async () => {
        render(<Info {...props} />)
        const nameInput = screen.getByPlaceholderText('Robin McHelpful')
        userEvent.type(nameInput, props.name + 'M')
        expect(props.setAgentState.mock.calls[0][0]({} as AgentState)).toEqual({
            name: props.name + 'M',
        })

        props.setAgentState.mockClear()

        const emailInput = screen.getByPlaceholderText('robin@mchelpful.com')
        userEvent.type(emailInput, props.email + 'N')
        expect(props.setAgentState.mock.calls[0][0]({} as AgentState)).toEqual({
            email: props.email + 'N',
        })
    })

    it('should disabled fields when viewing owner id', () => {
        render(<Info {...props} isEdit isViewingAccountOwner />)
        expect(screen.getByPlaceholderText('Robin McHelpful')).toBeDisabled()
        expect(
            screen.getByPlaceholderText('robin@mchelpful.com'),
        ).toBeDisabled()
    })

    it('should call inviteAgent when clicking invite button', async () => {
        render(<Info {...props} isEdit />)
        const inviteButton = screen.getByText('Resend invite')
        userEvent.click(inviteButton)
        await waitFor(() => {
            expect(mockedInviteAgent).toHaveBeenNthCalledWith(1, [1])
        })
    })
})
