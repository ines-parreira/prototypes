import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import HelpCenterEditModalFooter from '../HelpCenterEditModalFooter'

const mockedOnSave = jest.fn()
const mockedOnDelete = jest.fn()

describe('<HelpCenterEditModalFooter/>', () => {
    const props = {
        canSave: true,
        onSave: mockedOnSave,
        onDelete: mockedOnDelete,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(<HelpCenterEditModalFooter {...props} />)
        expect(container).toMatchSnapshot()
    })

    describe('dropdown button', () => {
        it('should trigger onSave when clicking on save list item', () => {
            const {getByRole} = render(
                <HelpCenterEditModalFooter {...props} canSave={true} />
            )
            const dropdownBtn = getByRole('button', {name: /toggle dropdown/i})
            fireEvent.click(dropdownBtn)
            const saveItem = getByRole('menuitem', {name: /save/i})
            fireEvent.click(saveItem)
            expect(mockedOnSave).toHaveBeenCalledTimes(1)
        })

        it('should trigger onDelete when clicking on delete list item', () => {
            const {getByRole} = render(<HelpCenterEditModalFooter {...props} />)
            const dropdownBtn = getByRole('button', {name: /toggle dropdown/i})
            fireEvent.click(dropdownBtn)
            const deleteItem = getByRole('menuitem', {name: /delete/i})
            fireEvent.click(deleteItem)
            expect(mockedOnDelete).toHaveBeenCalledTimes(1)
        })
    })
})
