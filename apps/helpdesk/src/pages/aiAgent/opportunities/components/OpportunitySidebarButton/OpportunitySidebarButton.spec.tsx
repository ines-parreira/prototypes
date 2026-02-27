import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunitySidebarButton } from './OpportunitySidebarButton'

jest.mock('../../hooks/useOpportunitiesSidebar')

describe('OpportunitySidebarButton', () => {
    let mockSetIsSidebarVisible: jest.Mock

    beforeEach(() => {
        mockSetIsSidebarVisible = jest.fn()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render button when sidebar is not visible', () => {
        const {
            useOpportunitiesSidebar,
        } = require('../../hooks/useOpportunitiesSidebar')
        useOpportunitiesSidebar.mockReturnValue({
            isSidebarVisible: false,
            setIsSidebarVisible: mockSetIsSidebarVisible,
        })

        render(<OpportunitySidebarButton />)

        const button = screen.getByRole('button', { name: /show sidebar/i })
        expect(button).toBeInTheDocument()
    })

    it('should not render button when sidebar is visible', () => {
        const {
            useOpportunitiesSidebar,
        } = require('../../hooks/useOpportunitiesSidebar')
        useOpportunitiesSidebar.mockReturnValue({
            isSidebarVisible: true,
            setIsSidebarVisible: mockSetIsSidebarVisible,
        })

        render(<OpportunitySidebarButton />)

        const button = screen.queryByRole('button', { name: /show sidebar/i })
        expect(button).not.toBeInTheDocument()
    })

    it('should call setIsSidebarVisible with true when button is clicked', async () => {
        const user = userEvent.setup()
        const {
            useOpportunitiesSidebar,
        } = require('../../hooks/useOpportunitiesSidebar')
        useOpportunitiesSidebar.mockReturnValue({
            isSidebarVisible: false,
            setIsSidebarVisible: mockSetIsSidebarVisible,
        })

        render(<OpportunitySidebarButton />)

        const button = screen.getByRole('button', { name: /show sidebar/i })
        await user.click(button)

        expect(mockSetIsSidebarVisible).toHaveBeenCalledTimes(1)
        expect(mockSetIsSidebarVisible).toHaveBeenCalledWith(true)
    })
})
