import {screen, render, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {navigateBackToUserList} from '../constants'
import {DeleteModal} from '../DeleteModal'

const mockedDeleteAgent = jest.fn(() => Promise.resolve(true))
jest.mock('hooks/agents/useDeleteAgent', () => ({
    useDeleteAgent: () => ({
        mutateAsync: mockedDeleteAgent,
        isLoading: false,
    }),
}))

describe('DeleteModal', () => {
    const props = {
        agentId: 1,
        name: 'M. Love',
        isModalOpen: true,
        setModalOpen: jest.fn(),
    }

    it('should display or not according to `isModalOpen` prop', async () => {
        const {rerender} = render(<DeleteModal {...props} />)
        expect(screen.getByText(`Delete ${props.name}?`))

        rerender(<DeleteModal {...props} isModalOpen={false} />)
        await waitFor(() => {
            expect(
                screen.queryByText(`Delete ${props.name}?`)
            ).not.toBeInTheDocument()
        })
    })

    it('should call `setModalOpen` props when clicking cancel', () => {
        render(<DeleteModal {...props} />)
        const cancelButton = screen.getByText('Cancel')
        userEvent.click(cancelButton)
        expect(props.setModalOpen).toHaveBeenCalledWith(false)
    })

    it('should call deleteAgent and setModalOpen when clicking delete button ', async () => {
        render(<DeleteModal {...props} />)
        const deleteButton = screen.getByText('Delete User')
        userEvent.click(deleteButton)
        expect(mockedDeleteAgent).toHaveBeenCalledWith([props.agentId], {
            onSuccess: navigateBackToUserList,
        })
        await waitFor(() => {
            expect(props.setModalOpen).toHaveBeenCalledWith(false)
        })
    })
})
