import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import AssignUser from '../AssignUser'
import UserAssigneeDropdownMenu from '../UserAssigneeDropdownMenu'

jest.mock(
    '../UserAssigneeDropdownMenu',
    () =>
        ({onClick}: ComponentProps<typeof UserAssigneeDropdownMenu>) => (
            <button onClick={() => onClick({id: 3, name: 'user'})}>
                UserAssigneeDropdownMenuMock
            </button>
        )
)

describe('<AssignUser />', () => {
    const minProps = {
        onClick: jest.fn(),
        isDisabled: false,
    }

    it('should render', () => {
        const {getByText} = render(<AssignUser {...minProps} />)

        expect(getByText('person')).toBeInTheDocument()
    })

    it('should trigger callback on click', () => {
        const {getByText} = render(<AssignUser {...minProps} />)
        getByText('person').click()
        getByText('UserAssigneeDropdownMenuMock').click()

        expect(minProps.onClick).toHaveBeenCalled()
    })

    it('should be disabled', () => {
        const {getByText} = render(<AssignUser {...minProps} isDisabled />)
        getByText('person').click()

        expect(minProps.onClick).not.toHaveBeenCalled()
    })
})
