import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { MoreOptions } from './MoreOptions'

describe('<MoreOptions />', () => {
    const shopName = 'test-shop'
    const mockHandleChangeStatus = jest.fn()

    function setup(journeyState: 'active' | 'draft' | 'paused' = 'paused') {
        render(
            <MemoryRouter>
                <MoreOptions
                    journeyState={journeyState}
                    shopName={shopName}
                    handleChangeStatus={mockHandleChangeStatus}
                />
            </MemoryRouter>,
        )
    }

    it('renders the menu button', () => {
        setup()
        expect(screen.getByText('more_horiz')).toBeInTheDocument()
    })

    it('opens and closes the menu on click', () => {
        setup()
        const menuButton = screen.getByText('more_horiz')
        fireEvent.click(menuButton)
        expect(screen.getByText('edit')).toBeInTheDocument()
        fireEvent.click(menuButton)
        expect(screen.queryByText('edit')).not.toBeInTheDocument()
    })

    it('renders all options when menu is open', () => {
        setup('active')
        fireEvent.click(screen.getByText('more_horiz'))
        expect(screen.getByText('Edit')).toBeInTheDocument()
        expect(screen.getByText('Test')).toBeInTheDocument()
        expect(screen.getByText('Activation')).toBeInTheDocument()
        expect(screen.getByText('Pause Journey')).toBeInTheDocument()
    })

    it('navigates to the correct route when a link is clicked', () => {
        setup()
        fireEvent.click(screen.getByText('more_horiz'))
        const editLink = screen.getByText('Test').closest('a')
        expect(editLink).toHaveAttribute(
            'to',
            `/app/ai-journey/${shopName}/test`,
        )
    })

    it('calls handleChangeStatus when pause is clicked', () => {
        setup('active')
        fireEvent.click(screen.getByText('more_horiz'))
        fireEvent.click(screen.getByText('Pause Journey'))
        expect(mockHandleChangeStatus).toHaveBeenCalledTimes(1)
    })

    it('closes the menu when clicking outside', () => {
        setup()
        fireEvent.click(screen.getByText('more_horiz'))
        expect(screen.getByText('Edit')).toBeInTheDocument()
        fireEvent.mouseDown(document)
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })
})
