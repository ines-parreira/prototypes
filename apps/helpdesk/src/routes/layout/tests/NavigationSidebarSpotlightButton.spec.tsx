import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SpotlightContext } from 'providers/ui/SpotlightContext'

import { NavigationSidebarSpotlightButton } from '../NavigationSidebarSpotlightButton'

describe('NavigationSidebarSpotlightButton', () => {
    const mockSetIsOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render search button', () => {
        render(<NavigationSidebarSpotlightButton />, {
            wrapper: ({ children }) => (
                <SpotlightContext.Provider
                    value={{ isOpen: false, setIsOpen: mockSetIsOpen }}
                >
                    {children}
                </SpotlightContext.Provider>
            ),
        })

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    it('should open spotlight when clicked and spotlight is closed', async () => {
        const user = userEvent.setup()
        render(<NavigationSidebarSpotlightButton />, {
            wrapper: ({ children }) => (
                <SpotlightContext.Provider
                    value={{ isOpen: false, setIsOpen: mockSetIsOpen }}
                >
                    {children}
                </SpotlightContext.Provider>
            ),
        })

        const button = screen.getByRole('button')
        await user.click(button)

        expect(mockSetIsOpen).toHaveBeenCalledWith(true)
    })

    it('should close spotlight when clicked and spotlight is open', async () => {
        const user = userEvent.setup()

        render(<NavigationSidebarSpotlightButton />, {
            wrapper: ({ children }) => (
                <SpotlightContext.Provider
                    value={{ isOpen: true, setIsOpen: mockSetIsOpen }}
                >
                    {children}
                </SpotlightContext.Provider>
            ),
        })

        const button = screen.getByRole('button')
        await user.click(button)

        expect(mockSetIsOpen).toHaveBeenCalledWith(false)
    })
})
