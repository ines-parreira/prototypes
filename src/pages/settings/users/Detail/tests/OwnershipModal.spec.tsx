import React from 'react'
import userEvent from '@testing-library/user-event'
import {screen, render, waitFor} from '@testing-library/react'
import {updateAccountOwner} from 'state/currentAccount/actions'
import {assumeMock} from 'utils/testing'

import {OwnershipModal} from '../OwnershipModal'

jest.mock('state/currentAccount/actions')
const mockedUpdateAccountOwner = assumeMock(updateAccountOwner)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

describe('OwnershipModal', () => {
    const props = {
        agentId: 1,
        name: 'M. Love',
        isModalOpen: true,
        setModalOpen: jest.fn(),
    }

    it('should display or not according to `isModalOpen` prop', async () => {
        const {rerender} = render(<OwnershipModal {...props} />)
        expect(screen.getByText(`Set ${props.name} as owner`))

        rerender(<OwnershipModal {...props} isModalOpen={false} />)
        await waitFor(() => {
            expect(
                screen.queryByText(`Set ${props.name} as owner`)
            ).not.toBeInTheDocument()
        })
    })

    it('should call `setModalOpen` props when clicking cancel', () => {
        render(<OwnershipModal {...props} />)
        const cancelButton = screen.getByText('Cancel')
        userEvent.click(cancelButton)
        expect(props.setModalOpen).toHaveBeenCalledWith(false)
    })

    it('should call updateAccountOwner and setModalOpen when clicking set button ', () => {
        render(<OwnershipModal {...props} />)
        const setButton = screen.getByText('Set As Owner')
        userEvent.click(setButton)
        expect(mockedUpdateAccountOwner).toHaveBeenCalledWith(props.agentId)
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(props.setModalOpen).toHaveBeenCalledWith(false)
    })
})
