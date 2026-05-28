import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCopilotPanel } from '@gorgias/copilot'

import { useCopilotEnabled } from 'hooks/useCopilotEnabled'

import { AskGaiaButton } from './AskGaiaButton'

jest.mock('hooks/useCopilotEnabled', () => ({
    useCopilotEnabled: jest.fn(() => true),
}))

const mockUseCopilotEnabled = assumeMock(useCopilotEnabled)
const mockUseCopilotPanel = assumeMock(useCopilotPanel)

const buildCopilotPanelMockReturn = (
    overrides: Partial<ReturnType<typeof useCopilotPanel>> = {},
): ReturnType<typeof useCopilotPanel> => ({
    isOpen: false,
    setIsOpen: jest.fn(),
    width: 400,
    setWidth: jest.fn(),
    ...overrides,
})

describe('AskGaiaButton', () => {
    beforeEach(() => {
        mockUseCopilotEnabled.mockReturnValue(true)
        mockUseCopilotPanel.mockReturnValue(buildCopilotPanelMockReturn())
    })

    it('renders nothing when copilot is disabled', () => {
        mockUseCopilotEnabled.mockReturnValue(false)

        render(
            <MockSidebarProvider>
                <AskGaiaButton />
            </MockSidebarProvider>,
        )

        expect(screen.queryByText(/ask gaia/i)).not.toBeInTheDocument()
    })

    it('shows the expanded label and shortcut when the sidebar is expanded', () => {
        render(
            <MockSidebarProvider isCollapsed={false}>
                <AskGaiaButton />
            </MockSidebarProvider>,
        )

        expect(
            screen.getByRole('button', { name: /ask gaia/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('⌘ + G')).toBeInTheDocument()
    })

    it('shows only the icon trigger when the sidebar is collapsed', () => {
        render(
            <MockSidebarProvider isCollapsed={true}>
                <AskGaiaButton />
            </MockSidebarProvider>,
        )

        expect(
            screen.getByRole('button', { name: /ask gaia/i }),
        ).toBeInTheDocument()
        expect(screen.queryByText('⌘ + G')).not.toBeInTheDocument()
    })

    it('opens copilot when the trigger is clicked', async () => {
        const setIsOpen = jest.fn()
        mockUseCopilotPanel.mockReturnValue(
            buildCopilotPanelMockReturn({ setIsOpen }),
        )
        const user = userEvent.setup()

        render(
            <MockSidebarProvider>
                <AskGaiaButton />
            </MockSidebarProvider>,
        )

        await user.click(screen.getByRole('button', { name: /ask gaia/i }))

        expect(setIsOpen).toHaveBeenCalledWith(true)
    })

    it('closes copilot when the trigger is clicked while open', async () => {
        const setIsOpen = jest.fn()
        mockUseCopilotPanel.mockReturnValue(
            buildCopilotPanelMockReturn({ isOpen: true, setIsOpen }),
        )
        const user = userEvent.setup()

        render(
            <MockSidebarProvider>
                <AskGaiaButton />
            </MockSidebarProvider>,
        )

        await user.click(screen.getByRole('button', { name: /ask gaia/i }))

        expect(setIsOpen).toHaveBeenCalledWith(false)
    })
})
