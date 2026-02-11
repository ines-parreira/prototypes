import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PlaygroundPanel } from './PlaygroundPanel'

jest.mock('pages/AppContext')
jest.mock('../../PlaygroundV2/AiAgentPlayground')
jest.mock(
    '../../PlaygroundV2/components/PlaygroundActionsModal/PlaygroundActionsModal',
)
jest.mock('pages/aiAgent/PlaygroundV2/utils/playground.utils', () => ({
    getActionsToggleTooltipContent: jest.fn(
        (actionsAllowed) =>
            `Actions are ${actionsAllowed ? 'enabled' : 'disabled'}`,
    ),
}))

const mockSetNavBarDisplay = jest.fn()

jest.mock('common/navigation/hooks/useNavBar/useNavBar', () => ({
    useNavBar: jest.fn(() => ({
        setNavBarDisplay: mockSetNavBarDisplay,
    })),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))

const mockUseAppContext = require('pages/AppContext').useAppContext as jest.Mock

const MockAiAgentPlayground = require('../../PlaygroundV2/AiAgentPlayground')
    .AiAgentPlayground as jest.Mock
const MockPlaygroundActionsModal =
    require('../../PlaygroundV2/components/PlaygroundActionsModal/PlaygroundActionsModal')
        .default as jest.Mock

describe('PlaygroundPanel', () => {
    const mockSetIsCollapsibleColumnOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockSetNavBarDisplay.mockClear()

        mockUseAppContext.mockReturnValue({
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        })

        MockAiAgentPlayground.mockImplementation(() => (
            <div data-testid="ai-agent-playground">AiAgentPlayground</div>
        ))

        MockPlaygroundActionsModal.mockImplementation(
            ({ isOpen, onClose, onConfirm }) => {
                if (!isOpen) return null
                return (
                    <div data-testid="actions-modal">
                        <button onClick={onClose}>Close Modal</button>
                        <button onClick={onConfirm}>Confirm Modal</button>
                    </div>
                )
            },
        )
    })

    describe('rendering', () => {
        it('should render panel with header and body', () => {
            render(<PlaygroundPanel />)

            expect(screen.getByText('Test')).toBeInTheDocument()
            expect(
                screen.getByTestId('ai-agent-playground'),
            ).toBeInTheDocument()
        })

        it('should collapse navbar on mount by default', () => {
            render(<PlaygroundPanel />)

            expect(mockSetNavBarDisplay).toHaveBeenCalledWith('collapsed')
        })

        it('should not collapse navbar when collapseNavbar=false', () => {
            render(<PlaygroundPanel collapseNavbar={false} />)

            expect(mockSetNavBarDisplay).not.toHaveBeenCalled()
        })

        it('should collapse navbar when collapseNavbar=true', () => {
            render(<PlaygroundPanel collapseNavbar={true} />)

            expect(mockSetNavBarDisplay).toHaveBeenCalledWith('collapsed')
        })

        it('should render actions toggle in disabled state initially', () => {
            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()
        })

        it('should render reset button', () => {
            render(<PlaygroundPanel />)

            const resetButton = screen.getAllByRole('button', {
                name: /reset playground/,
            })[0]
            expect(resetButton).toBeInTheDocument()
        })

        it('should render close button', () => {
            render(<PlaygroundPanel />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })
            expect(closeButton).toBeInTheDocument()
        })

        it('should render Actions label', () => {
            render(<PlaygroundPanel />)

            expect(screen.getByText('Actions')).toBeInTheDocument()
        })

        it('should render info tooltip', () => {
            render(<PlaygroundPanel />)

            const infoIcon = screen.getByText('info')
            expect(infoIcon).toBeInTheDocument()
        })
    })

    describe('close functionality', () => {
        it('should call setIsCollapsibleColumnOpen(false) when close button is clicked', async () => {
            render(<PlaygroundPanel />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await userEvent.click(closeButton)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should call onClose callback when provided and close button is clicked', async () => {
            const mockOnClose = jest.fn()
            render(<PlaygroundPanel onClose={mockOnClose} />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await userEvent.click(closeButton)

            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('should call both setIsCollapsibleColumnOpen and onClose when both are available', async () => {
            const mockOnClose = jest.fn()
            render(<PlaygroundPanel onClose={mockOnClose} />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await userEvent.click(closeButton)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('should not throw error when onClose is not provided', async () => {
            render(<PlaygroundPanel />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await expect(userEvent.click(closeButton)).resolves.not.toThrow()
            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })
    })

    describe('reset playground functionality', () => {
        it('should pass resetPlayground=true to AiAgentPlayground when reset button is clicked', async () => {
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await userEvent.click(resetButton)

            await waitFor(() => {
                expect(MockAiAgentPlayground).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        resetPlayground: true,
                    }),
                    {},
                )
            })
        })

        it('should reset resetPlayground to false after callback', async () => {
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await userEvent.click(resetButton)

            // Get the resetPlaygroundCallback prop
            const lastCall =
                MockAiAgentPlayground.mock.calls[
                    MockAiAgentPlayground.mock.calls.length - 1
                ]
            const resetPlaygroundCallback = lastCall[0].resetPlaygroundCallback

            // Call the callback
            resetPlaygroundCallback()

            await waitFor(() => {
                expect(MockAiAgentPlayground).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        resetPlayground: false,
                    }),
                    {},
                )
            })
        })
    })

    describe('actions toggle functionality', () => {
        it('should open modal when toggle is clicked to enable actions', async () => {
            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')

            await userEvent.click(toggle)

            await waitFor(() => {
                expect(screen.getByTestId('actions-modal')).toBeInTheDocument()
            })
        })

        it('should close modal when cancel is clicked', async () => {
            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')
            await userEvent.click(toggle)

            const closeButton = await screen.findByText('Close Modal')
            await userEvent.click(closeButton)

            await waitFor(() => {
                expect(
                    screen.queryByTestId('actions-modal'),
                ).not.toBeInTheDocument()
            })
        })

        it('should enable actions and close modal when confirmed', async () => {
            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')
            await userEvent.click(toggle)

            const confirmButton = await screen.findByText('Confirm Modal')
            await userEvent.click(confirmButton)

            await waitFor(() => {
                expect(
                    screen.queryByTestId('actions-modal'),
                ).not.toBeInTheDocument()
                expect(toggle).toBeChecked()
            })
        })

        it('should pass actionsAllowed=true to AiAgentPlayground after confirmation', async () => {
            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')
            await userEvent.click(toggle)

            const confirmButton = await screen.findByText('Confirm Modal')
            await userEvent.click(confirmButton)

            await waitFor(() => {
                expect(MockAiAgentPlayground).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        arePlaygroundActionsAllowed: true,
                    }),
                    {},
                )
            })
        })

        it('should disable actions when toggle is clicked while enabled', async () => {
            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')

            // Enable actions
            await userEvent.click(toggle)
            const confirmButton = await screen.findByText('Confirm Modal')
            await userEvent.click(confirmButton)

            await waitFor(() => {
                expect(toggle).toBeChecked()
            })

            // Disable actions
            await userEvent.click(toggle)

            await waitFor(() => {
                expect(toggle).not.toBeChecked()
                expect(MockAiAgentPlayground).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        arePlaygroundActionsAllowed: false,
                    }),
                    {},
                )
            })
        })
    })

    describe('AiAgentPlayground integration', () => {
        it('should pass withResetButton=false to AiAgentPlayground', () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    withResetButton: false,
                }),
                {},
            )
        })

        it('should pass shopName prop to AiAgentPlayground when provided', () => {
            render(<PlaygroundPanel shopName="test-shop" />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopName: 'test-shop',
                }),
                {},
            )
        })

        it('should not pass shopName to AiAgentPlayground when not provided', () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopName: undefined,
                }),
                {},
            )
        })

        it('should pass draftKnowledge prop to AiAgentPlayground when provided', () => {
            const draftKnowledge = { sourceId: 1, sourceSetId: 1 }
            render(<PlaygroundPanel draftKnowledge={draftKnowledge} />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftKnowledge,
                }),
                {},
            )
        })

        it('should not pass draftKnowledge to AiAgentPlayground when not provided', () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftKnowledge: undefined,
                }),
                {},
            )
        })

        it('should pass resetPlaygroundCallback to AiAgentPlayground', () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    resetPlaygroundCallback: expect.any(Function),
                }),
                {},
            )
        })

        it('should initially pass resetPlayground=false to AiAgentPlayground', () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    resetPlayground: false,
                }),
                {},
            )
        })

        it('should initially pass arePlaygroundActionsAllowed=false to AiAgentPlayground', () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    arePlaygroundActionsAllowed: false,
                }),
                {},
            )
        })
    })

    describe('PlaygroundActionsModal integration', () => {
        it('should pass isOpen=false initially to PlaygroundActionsModal', () => {
            render(<PlaygroundPanel />)

            expect(MockPlaygroundActionsModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: false,
                }),
                {},
            )
        })

        it('should pass onClose callback to PlaygroundActionsModal', () => {
            render(<PlaygroundPanel />)

            expect(MockPlaygroundActionsModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    onClose: expect.any(Function),
                }),
                {},
            )
        })

        it('should pass onConfirm callback to PlaygroundActionsModal', () => {
            render(<PlaygroundPanel />)

            expect(MockPlaygroundActionsModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    onConfirm: expect.any(Function),
                }),
                {},
            )
        })
    })

    describe('tooltip content', () => {
        it('should show correct tooltip content when actions are disabled', () => {
            const {
                getActionsToggleTooltipContent,
            } = require('pages/aiAgent/PlaygroundV2/utils/playground.utils')

            render(<PlaygroundPanel />)

            expect(getActionsToggleTooltipContent).toHaveBeenCalledWith(false)
        })

        it('should show correct tooltip content when actions are enabled', async () => {
            const {
                getActionsToggleTooltipContent,
            } = require('pages/aiAgent/PlaygroundV2/utils/playground.utils')

            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')
            await userEvent.click(toggle)

            const confirmButton = await screen.findByText('Confirm Modal')
            await userEvent.click(confirmButton)

            await waitFor(() => {
                expect(getActionsToggleTooltipContent).toHaveBeenCalledWith(
                    true,
                )
            })
        })
    })

    describe('edge cases', () => {
        it('should handle rapid toggle clicks', async () => {
            render(<PlaygroundPanel />)

            const toggle = screen.getByRole('checkbox')

            await userEvent.click(toggle)

            // Close the modal
            const closeButton = await screen.findByText('Close Modal')
            await userEvent.click(closeButton)

            await userEvent.click(toggle)

            // Should still open the modal on the last click
            await waitFor(() => {
                expect(screen.getByTestId('actions-modal')).toBeInTheDocument()
            })
        })

        it('should handle multiple reset clicks', async () => {
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await userEvent.click(resetButton)
            await userEvent.click(resetButton)
            await userEvent.click(resetButton)

            expect(MockAiAgentPlayground).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    resetPlayground: true,
                }),
                {},
            )
        })
    })

    describe('button tooltips', () => {
        it('should show tooltip when hovering over reset button', async () => {
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await userEvent.hover(resetButton)

            await waitFor(() => {
                expect(screen.getByText('Reset test')).toBeInTheDocument()
            })
        })

        it('should show tooltip when hovering over close button', async () => {
            render(<PlaygroundPanel />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await userEvent.hover(closeButton)

            await waitFor(() => {
                expect(screen.getByText('Close')).toBeInTheDocument()
            })
        })
    })

    describe('Settings toggle functionality', () => {
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock

        beforeEach(() => {
            jest.clearAllMocks()
            mockUseFlag.mockReturnValue(true)
        })

        it('should show settings button and hide actions toggle when enabled', () => {
            render(<PlaygroundPanel />)

            expect(
                screen.getByRole('button', { name: /settings/i }),
            ).toBeInTheDocument()
            expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
        })

        it('should toggle inplaceSettingsOpen prop when settings button clicked', async () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({ inplaceSettingsOpen: false }),
                {},
            )

            await userEvent.click(
                screen.getByRole('button', { name: /settings/i }),
            )

            await waitFor(() => {
                expect(MockAiAgentPlayground).toHaveBeenLastCalledWith(
                    expect.objectContaining({ inplaceSettingsOpen: true }),
                    {},
                )
            })
        })

        it('should pass supportedModes and callback handler to AiAgentPlayground', () => {
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    supportedModes: ['inbound'],
                    onInplaceSettingsOpenChange: expect.any(Function),
                }),
                {},
            )
        })
    })

    describe('onGuidanceClick', () => {
        it('should pass onGuidanceClick handler to AiAgentPlayground', () => {
            const mockOnGuidanceClick = jest.fn()
            render(<PlaygroundPanel onGuidanceClick={mockOnGuidanceClick} />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({
                    onGuidanceClick: expect.any(Function),
                }),
                {},
            )
        })

        it('should close playground and call onGuidanceClick when guidance is clicked', () => {
            const mockOnGuidanceClick = jest.fn()
            render(<PlaygroundPanel onGuidanceClick={mockOnGuidanceClick} />)

            const onGuidanceClickHandler =
                MockAiAgentPlayground.mock.calls[0][0].onGuidanceClick

            onGuidanceClickHandler(123)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
            expect(mockOnGuidanceClick).toHaveBeenCalledWith(123)
        })

        it('should close playground even when onGuidanceClick is not provided', () => {
            render(<PlaygroundPanel />)

            const onGuidanceClickHandler =
                MockAiAgentPlayground.mock.calls[0][0].onGuidanceClick

            onGuidanceClickHandler(123)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should call onClose if provided when closing via guidance click', () => {
            const mockOnClose = jest.fn()
            const mockOnGuidanceClick = jest.fn()
            render(
                <PlaygroundPanel
                    onClose={mockOnClose}
                    onGuidanceClick={mockOnGuidanceClick}
                />,
            )

            const onGuidanceClickHandler =
                MockAiAgentPlayground.mock.calls[0][0].onGuidanceClick

            onGuidanceClickHandler(123)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
            expect(mockOnClose).toHaveBeenCalled()
            expect(mockOnGuidanceClick).toHaveBeenCalledWith(123)
        })
    })
})
