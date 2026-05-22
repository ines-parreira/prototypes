import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCopilot } from '@gorgias/copilot'

import { useCopilotEnabled } from 'hooks/useCopilotEnabled'

import { AskGaiaButton } from './AskGaiaButton'

jest.mock('hooks/useCopilotEnabled', () => ({
    useCopilotEnabled: jest.fn(() => true),
}))

const mockUseCopilotEnabled = assumeMock(useCopilotEnabled)
const mockUseCopilot = assumeMock(useCopilot)

const buildCopilotMockReturn = (
    overrides: Partial<ReturnType<typeof useCopilot>> = {},
) =>
    ({
        open: false,
        setOpen: jest.fn(),
        sendPrompt: jest.fn(),
        resetThread: jest.fn(),
        abort: jest.fn(),
        agent: undefined,
        runtimeUrl: '',
        ...overrides,
    }) as unknown as ReturnType<typeof useCopilot>

describe('AskGaiaButton', () => {
    beforeEach(() => {
        mockUseCopilotEnabled.mockReturnValue(true)
        mockUseCopilot.mockReturnValue(buildCopilotMockReturn())
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
        const setOpen = jest.fn()
        mockUseCopilot.mockReturnValue(buildCopilotMockReturn({ setOpen }))
        const user = userEvent.setup()

        render(
            <MockSidebarProvider>
                <AskGaiaButton />
            </MockSidebarProvider>,
        )

        await user.click(screen.getByRole('button', { name: /ask gaia/i }))

        expect(setOpen).toHaveBeenCalledWith(true)
    })

    it('closes copilot when the trigger is clicked while open', async () => {
        const setOpen = jest.fn()
        mockUseCopilot.mockReturnValue(
            buildCopilotMockReturn({ open: true, setOpen }),
        )
        const user = userEvent.setup()

        render(
            <MockSidebarProvider>
                <AskGaiaButton />
            </MockSidebarProvider>,
        )

        await user.click(screen.getByRole('button', { name: /ask gaia/i }))

        expect(setOpen).toHaveBeenCalledWith(false)
    })
})
