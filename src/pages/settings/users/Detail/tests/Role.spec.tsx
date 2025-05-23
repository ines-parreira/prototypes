import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import { UserRole } from 'config/types/user'
import { ORDERED_ROLES_META_BY_USER_ROLE } from 'config/user'
import { userEvent } from 'utils/testing/userEvent'

import { Role } from '../Role'
import { AgentState } from '../types'

const props = {
    role: UserRole.Agent,
    setAgentState: jest.fn((cb: (param: AgentState) => AgentState) => cb),
    isSelf: false,
    isInternal: false,
    isViewingAccountOwner: false,
}

describe('Role', () => {
    it('should render all possible roles', () => {
        render(<Role {...props} />)
        for (const [, { label }] of ORDERED_ROLES_META_BY_USER_ROLE) {
            expect(screen.getByText(label)).toBeInTheDocument()
        }
    })

    it('should render only role label for bot', () => {
        render(<Role {...props} role={UserRole.Bot} isInternal={true} />)
        expect(screen.getByText('Bot')).toBeInTheDocument()
        for (const [, { label }] of ORDERED_ROLES_META_BY_USER_ROLE) {
            expect(screen.queryByText(label)).not.toBeInTheDocument()
        }
    })

    it('should render only role label for internal agent', () => {
        render(
            <Role {...props} role={UserRole.GorgiasAgent} isInternal={true} />,
        )
        expect(screen.getByText('Gorgias Support')).toBeInTheDocument()
        for (const [, { label }] of ORDERED_ROLES_META_BY_USER_ROLE) {
            expect(screen.queryByText(label)).not.toBeInTheDocument()
        }
    })

    it('should call `setAgentState` when a role is clicked', () => {
        render(<Role {...props} />)
        const role = screen.getByText(
            ORDERED_ROLES_META_BY_USER_ROLE[0][1].label,
        )
        userEvent.click(role)
        expect(props.setAgentState.mock.calls[0][0]({} as AgentState)).toEqual({
            role: ORDERED_ROLES_META_BY_USER_ROLE[0][0],
        })
    })

    it('should show a tooltip when `isSelf` and when `isViewingAccountOwner`', async () => {
        const { rerender } = render(<Role {...props} isSelf={true} />)

        userEvent.hover(
            screen
                .getByText(ORDERED_ROLES_META_BY_USER_ROLE[0][1].label)
                .closest('div')!,
        )
        await waitFor(() => {
            expect(screen.getByText(/cannot update/i)).toBeVisible()
        })

        rerender(<Role {...props} isViewingAccountOwner />)

        userEvent.hover(
            screen
                .getByText(ORDERED_ROLES_META_BY_USER_ROLE[0][1].label)
                .closest('div')!,
        )
        await waitFor(() => {
            expect(screen.getByText(/cannot edit/i)).toBeVisible()
        })
    })
})
