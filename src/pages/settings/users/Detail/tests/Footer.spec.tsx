import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {User, UserRole} from 'config/types/user'
import {assumeMock} from 'utils/testing'

import {Footer} from '../Footer'
import {DeleteModal} from '../DeleteModal'

jest.mock('../DeleteModal', () => ({
    DeleteModal: jest.fn(() => <div>DeleteModal</div>),
}))
const mockedDeleteModal = assumeMock(DeleteModal)

const defaultAgentState = {
    name: 'M. Love',
    email: 'mister@love.com',
    role: UserRole.Admin,
}

describe('Footer', () => {
    it('should disable submit button if no name or email is input', () => {
        render(
            <Footer
                rawData={undefined}
                agentState={{name: '', email: '', role: UserRole.Agent}}
                isEdit={false}
                agentId={1}
            />
        )

        expect(screen.getByText('Create user')).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('should not disable submit button in edit mode if something is different', () => {
        render(
            <Footer
                rawData={
                    {
                        ...defaultAgentState,
                        role: {name: UserRole.Agent},
                    } as User
                }
                agentState={defaultAgentState}
                isEdit={true}
                agentId={1}
            />
        )

        expect(screen.getByText('Save Changes')).not.toHaveAttribute(
            'aria-disabled',
            'true'
        )
        expect(screen.getByText('Cancel'))
    })

    it('should disable submit button in edit mode if info is the same', () => {
        render(
            <Footer
                rawData={
                    {
                        ...defaultAgentState,
                        role: {name: UserRole.Admin},
                    } as User
                }
                agentState={defaultAgentState}
                isEdit={true}
                agentId={1}
            />
        )

        expect(screen.getByText('Save Changes')).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('should disable submit button if viewing account owner and show a tooltip', async () => {
        render(
            <Footer
                rawData={
                    {
                        ...defaultAgentState,
                        role: {name: UserRole.Agent},
                    } as User
                }
                agentState={defaultAgentState}
                isEdit={true}
                agentId={1}
                isViewingAccountOwner={true}
                isSelf={false}
            />
        )

        const submitButton = screen.getByText('Save Changes')
        expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        userEvent.hover(submitButton)
        await waitFor(() => {
            expect(screen.getByText(/cannot edit/)).toBeVisible()
        })
    })

    it('should have a delete button that shows a tooltip', async () => {
        render(
            <Footer
                rawData={
                    {
                        ...defaultAgentState,
                        role: {name: UserRole.Agent},
                    } as User
                }
                agentState={defaultAgentState}
                isViewingAccountOwner
                isEdit
                agentId={1}
            />
        )

        const deleteButton = screen.getByText('Delete user').parentElement
        expect(deleteButton).toHaveAttribute('aria-disabled', 'true')

        userEvent.hover(deleteButton!)
        await waitFor(() => {
            expect(screen.getByText(/to delete/i)).toBeVisible()
        })
    })

    it('should open modal when delete is clicked', () => {
        render(
            <Footer
                rawData={
                    {
                        ...defaultAgentState,
                        role: {name: UserRole.Agent},
                    } as User
                }
                agentState={defaultAgentState}
                isEdit
                agentId={2}
            />
        )

        userEvent.click(screen.getByText('Delete user'))
        expect(mockedDeleteModal).toHaveBeenLastCalledWith(
            expect.objectContaining({isModalOpen: true}),
            {}
        )
    })
})
