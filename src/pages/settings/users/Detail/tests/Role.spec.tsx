import React from 'react'
import userEvent from '@testing-library/user-event'
import {screen, render, waitFor} from '@testing-library/react'

import {UserRole} from 'config/types/user'
import {ORDERED_ROLES_META_BY_USER_ROLE} from 'config/user'
import {Role} from '../Role'
import {AgentState} from '../types'

const props = {
    role: UserRole.Agent,
    setAgentState: jest.fn((cb: (param: AgentState) => AgentState) => cb),
    isSelf: false,
    isViewingAccountOwner: false,
}

describe('Role', () => {
    it('should render all possible roles', () => {
        render(<Role {...props} />)
        for (const [, {label}] of ORDERED_ROLES_META_BY_USER_ROLE) {
            expect(screen.getByText(label)).toBeInTheDocument()
        }
    })

    it('should call `setAgentState` when a role is clicked', () => {
        render(<Role {...props} />)
        const role = screen.getByText(
            ORDERED_ROLES_META_BY_USER_ROLE[0][1].label
        )
        userEvent.click(role)
        expect(props.setAgentState.mock.calls[0][0]({} as AgentState)).toEqual({
            role: ORDERED_ROLES_META_BY_USER_ROLE[0][0],
        })
    })

    it('should show a tooltip when `isSelf` and when `isViewingAccountOwner`', async () => {
        const {rerender} = render(<Role {...props} isSelf={true} />)

        userEvent.hover(
            screen
                .getByText(ORDERED_ROLES_META_BY_USER_ROLE[0][1].label)
                .closest('div')!
        )
        await waitFor(() => {
            expect(screen.getByText(/cannot update/i)).toBeVisible()
        })

        rerender(<Role {...props} isViewingAccountOwner />)

        userEvent.hover(
            screen
                .getByText(ORDERED_ROLES_META_BY_USER_ROLE[0][1].label)
                .closest('div')!
        )
        await waitFor(() => {
            expect(screen.getByText(/cannot edit/i)).toBeVisible()
        })
    })
})
