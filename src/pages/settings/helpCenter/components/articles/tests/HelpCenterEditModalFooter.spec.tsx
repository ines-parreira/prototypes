import React, {ComponentProps} from 'react'
import {render, fireEvent, waitFor, within} from '@testing-library/react'

import HelpCenterEditModalFooter from '../HelpCenterEditModalFooter'

const mockedOnSave = jest.fn()
const mockedOnDelete = jest.fn()
const mockedOnDiscard = jest.fn()

describe('<HelpCenterEditModalFooter />', () => {
    const props: ComponentProps<typeof HelpCenterEditModalFooter> = {
        canSave: true,
        canDelete: true,
        requiredFields: [],
        onSave: mockedOnSave,
        onDelete: mockedOnDelete,
        onDiscard: mockedOnDiscard,
        counters: {charCount: 1752},
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(<HelpCenterEditModalFooter {...props} />)

        expect(container).toMatchSnapshot()
    })

    it('should trigger onSave when clicking on save button', () => {
        const {getByRole} = render(
            <HelpCenterEditModalFooter {...props} canSave={true} />
        )

        const saveBtn = getByRole('button', {name: /Save Article/i})
        fireEvent.click(saveBtn)

        expect(mockedOnSave).toHaveBeenCalledTimes(1)
    })

    it('should trigger onDelete when confirming the delete action', () => {
        const {getByRole, getByText} = render(
            <HelpCenterEditModalFooter {...props} />
        )

        const deleteBtn = getByRole('button', {name: /Delete Article/i})
        fireEvent.click(deleteBtn)

        void waitFor(() =>
            getByText('Are you sure you want to delete this article?')
        )

        const dialogModal = getByRole('dialog')
        const confirmButton = within(dialogModal).getByText(/Delete article/i)

        fireEvent.click(confirmButton)

        expect(mockedOnDelete).toHaveBeenCalledTimes(1)
    })

    it('should trigger onDiscard when clicking on discard button', () => {
        const {getByRole} = render(<HelpCenterEditModalFooter {...props} />)

        const discardBtn = getByRole('button', {name: /Discard changes/i})
        fireEvent.click(discardBtn)

        expect(mockedOnDiscard).toHaveBeenCalledTimes(1)
    })
})
