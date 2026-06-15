import { logEvent, SegmentEvent } from '@repo/logging'
import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCopilotPanel, useRunLifecycle } from '@gorgias/copilot'

import { useCopilotEnabled } from 'hooks/useCopilotEnabled'

import { AskGaiaButton } from './AskGaiaButton'

jest.mock('hooks/useCopilotEnabled', () => ({
    useCopilotEnabled: jest.fn(() => true),
}))

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { CopilotOpened: 'copilot-opened' },
}))

const mockUseCopilotEnabled = assumeMock(useCopilotEnabled)
const mockUseCopilotPanel = assumeMock(useCopilotPanel)
const mockUseRunLifecycle = assumeMock(useRunLifecycle)
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

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
        mockUseRunLifecycle.mockReturnValue({ isRunning: false })
        mockLogEvent.mockClear()
    })

    it('renders nothing when copilot is disabled', () => {
        mockUseCopilotEnabled.mockReturnValue(false)

        render(renderComponent())

        expect(screen.queryByText(/ask gaia/i)).not.toBeInTheDocument()
    })

    it('shows the expanded label and shortcut when the sidebar is expanded', () => {
        render(renderComponent({ isCollapsed: false }))

        expect(
            screen.getByRole('button', { name: /ask gaia/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('⌘')).toBeInTheDocument()
        expect(screen.getByText('G')).toBeInTheDocument()
    })

    it('shows only the icon trigger when the sidebar is collapsed', () => {
        render(renderComponent({ isCollapsed: true }))

        expect(
            screen.getByRole('button', { name: /ask gaia/i }),
        ).toBeInTheDocument()
        expect(screen.queryByText('⌘')).not.toBeInTheDocument()
    })

    it('opens copilot when the trigger is clicked', async () => {
        const setIsOpen = jest.fn()
        mockUseCopilotPanel.mockReturnValue(
            buildCopilotPanelMockReturn({ setIsOpen }),
        )
        const user = userEvent.setup()

        render(renderComponent())

        await user.click(screen.getByRole('button', { name: /ask gaia/i }))

        expect(setIsOpen).toHaveBeenCalledWith(true)
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotOpened,
            expect.objectContaining({ trigger: 'icon', product: 'inbox' }),
        )
    })

    it('closes copilot when the trigger is clicked while open', async () => {
        const setIsOpen = jest.fn()
        mockUseCopilotPanel.mockReturnValue(
            buildCopilotPanelMockReturn({ isOpen: true, setIsOpen }),
        )
        const user = userEvent.setup()

        render(renderComponent())

        await user.click(screen.getByRole('button', { name: /ask gaia/i }))

        expect(setIsOpen).toHaveBeenCalledWith(false)
        expect(mockLogEvent).not.toHaveBeenCalled()
    })
})

function renderComponent({
    isCollapsed,
}: {
    isCollapsed?: boolean
} = {}) {
    return (
        <MockSidebarProvider isCollapsed={isCollapsed}>
            <AskGaiaButton />
        </MockSidebarProvider>
    )
}
