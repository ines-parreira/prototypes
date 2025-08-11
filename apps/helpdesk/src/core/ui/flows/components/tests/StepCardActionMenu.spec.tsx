import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StepCardActionMenu } from '../StepCardActionMenu'
import { StepCardActionMenuItem } from '../StepCardActionMenuItem'

describe('StepCardActionMenu', () => {
    it('should render menu button', () => {
        const onClickMock = jest.fn()

        render(
            <StepCardActionMenu>
                <StepCardActionMenuItem label="Edit" onClick={onClickMock} />
            </StepCardActionMenu>,
        )

        expect(screen.getByTitle('Action menu')).toBeInTheDocument()
        expect(screen.getByText('more_vert')).toBeInTheDocument()
    })

    it('should show dropdown when menu button is clicked', async () => {
        const user = userEvent.setup()
        const menuOptions = [
            {
                label: 'Edit',
                onClick: jest.fn(),
            },
            {
                label: 'Delete',
                onClick: jest.fn(),
            },
        ]

        render(
            <StepCardActionMenu>
                {menuOptions.map((option, index) => (
                    <StepCardActionMenuItem
                        label={option.label}
                        onClick={option.onClick}
                        key={index}
                    />
                ))}
            </StepCardActionMenu>,
        )

        const menuButton = screen.getByTitle('Action menu')
        await act(async () => {
            await user.click(menuButton)
        })

        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument()
            expect(screen.getByText('Delete')).toBeInTheDocument()
        })
    })

    it('should call onClick handler when menu option is clicked', async () => {
        const user = userEvent.setup()
        const handleEdit = jest.fn()
        const handleDelete = jest.fn()
        const menuOptions = [
            {
                label: 'Edit',
                onClick: handleEdit,
            },
            {
                label: 'Delete',
                onClick: handleDelete,
            },
        ]

        render(
            <StepCardActionMenu>
                {menuOptions.map((option, index) => (
                    <StepCardActionMenuItem
                        label={option.label}
                        onClick={option.onClick}
                        key={index}
                    />
                ))}
            </StepCardActionMenu>,
        )

        const menuButton = screen.getByTitle('Action menu')
        await act(async () => {
            await user.click(menuButton)
        })

        const editOption = await screen.findByText('Edit')
        await act(async () => {
            await user.click(editOption)
        })

        waitFor(() => {
            expect(handleEdit).toHaveBeenCalledTimes(1)
            expect(handleDelete).not.toHaveBeenCalled()
        })
    })
})
