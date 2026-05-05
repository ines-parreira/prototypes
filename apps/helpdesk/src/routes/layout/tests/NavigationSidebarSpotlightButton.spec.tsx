import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SpotlightContext } from 'providers/ui/SpotlightContext'

import { NavigationSidebarSpotlightButton } from '../NavigationSidebarSpotlightButton'

let mockIsMacOs = false

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    get isMacOs() {
        return mockIsMacOs
    },
}))

describe('NavigationSidebarSpotlightButton', () => {
    const mockSetIsOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockIsMacOs = false
    })

    it('should render search button', () => {
        render(<NavigationSidebarSpotlightButton />, {
            wrapper: ({ children }) => (
                <MockSidebarProvider>
                    <SpotlightContext.Provider
                        value={{ isOpen: false, setIsOpen: mockSetIsOpen }}
                    >
                        {children}
                    </SpotlightContext.Provider>
                </MockSidebarProvider>
            ),
        })

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    it('should open spotlight when clicked and spotlight is closed', async () => {
        const user = userEvent.setup()
        render(<NavigationSidebarSpotlightButton />, {
            wrapper: ({ children }) => (
                <MockSidebarProvider>
                    <SpotlightContext.Provider
                        value={{ isOpen: false, setIsOpen: mockSetIsOpen }}
                    >
                        {children}
                    </SpotlightContext.Provider>
                </MockSidebarProvider>
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
                <MockSidebarProvider>
                    <SpotlightContext.Provider
                        value={{ isOpen: true, setIsOpen: mockSetIsOpen }}
                    >
                        {children}
                    </SpotlightContext.Provider>
                </MockSidebarProvider>
            ),
        })

        const button = screen.getByRole('button')
        await user.click(button)

        expect(mockSetIsOpen).toHaveBeenCalledWith(false)
    })

    it('should show ⌘K shortcut in the tooltip on macOS', async () => {
        mockIsMacOs = true
        const user = userEvent.setup()

        render(<NavigationSidebarSpotlightButton />, {
            wrapper: ({ children }) => (
                <MockSidebarProvider isCollapsed>
                    <SpotlightContext.Provider
                        value={{ isOpen: false, setIsOpen: mockSetIsOpen }}
                    >
                        {children}
                    </SpotlightContext.Provider>
                </MockSidebarProvider>
            ),
        })

        await user.tab()

        expect(screen.getByText('⌘K')).toBeInTheDocument()
    })

    it('should show CTRLK shortcut in the tooltip on non-macOS', async () => {
        mockIsMacOs = false
        const user = userEvent.setup()

        render(<NavigationSidebarSpotlightButton />, {
            wrapper: ({ children }) => (
                <MockSidebarProvider isCollapsed>
                    <SpotlightContext.Provider
                        value={{ isOpen: false, setIsOpen: mockSetIsOpen }}
                    >
                        {children}
                    </SpotlightContext.Provider>
                </MockSidebarProvider>
            ),
        })

        await user.tab()

        expect(screen.getByText('CTRLK')).toBeInTheDocument()
    })
})
