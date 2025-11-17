import type { ComponentProps } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import AssignUser from '../AssignUser'
import type UserAssigneeDropdownMenu from '../UserAssigneeDropdownMenu'

jest.mock(
    '../UserAssigneeDropdownMenu',
    () =>
        ({ onClick }: ComponentProps<typeof UserAssigneeDropdownMenu>) => (
            <button onClick={() => onClick({ id: 3, name: 'user' })}>
                UserAssigneeDropdownMenuMock
            </button>
        ),
)

describe('<AssignUser />', () => {
    const minProps = {
        onClick: jest.fn(),
        isDisabled: false,
    }

    it('should render', () => {
        render(<AssignUser {...minProps} />)

        expect(screen.getByText('person')).toBeInTheDocument()
    })

    it('should trigger callback on click', async () => {
        const user = userEvent.setup()
        render(<AssignUser {...minProps} />)

        await user.click(screen.getByText('person'))
        await user.click(screen.getByText('UserAssigneeDropdownMenuMock'))

        await waitFor(() => {
            expect(minProps.onClick).toHaveBeenCalled()
        })
    })

    it('should be disabled', async () => {
        const user = userEvent.setup()
        render(<AssignUser {...minProps} isDisabled />)

        await user.click(screen.getByText('person'))

        expect(minProps.onClick).not.toHaveBeenCalled()
    })
})
