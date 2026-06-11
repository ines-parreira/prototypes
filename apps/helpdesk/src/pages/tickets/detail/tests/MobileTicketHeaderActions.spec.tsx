import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { openPanel } from 'state/layout/actions'

import { MobileTicketHeaderActions } from '../MobileTicketHeaderActions'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('state/layout/actions', () => ({
    openPanel: jest.fn(() => ({ type: 'OPEN_PANEL' })),
}))

const mockDispatch = jest.fn()

describe('MobileTicketHeaderActions', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(mockDispatch)
    })

    it('renders the "More info" button', () => {
        render(<MobileTicketHeaderActions />)

        expect(
            screen.getByRole('button', { name: /more info/i }),
        ).toBeInTheDocument()
    })

    it('dispatches openPanel("infobar") when clicked', async () => {
        const user = userEvent.setup()
        render(<MobileTicketHeaderActions />)

        await user.click(screen.getByRole('button', { name: /more info/i }))

        expect(openPanel).toHaveBeenCalledWith('infobar')
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'OPEN_PANEL' })
    })
})
