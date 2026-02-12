import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlaygroundPanel } from './PlaygroundPanel'

jest.mock('pages/AppContext')
jest.mock('../../PlaygroundV2/AiAgentPlayground')
jest.mock(
    '../../PlaygroundV2/components/PlaygroundActionsModal/PlaygroundActionsModal',
)

const mockSetNavBarDisplay = jest.fn()

jest.mock('common/navigation/hooks/useNavBar/useNavBar', () => ({
    useNavBar: jest.fn(() => ({
        setNavBarDisplay: mockSetNavBarDisplay,
    })),
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

        it('should render settings button', () => {
            render(<PlaygroundPanel />)

            const settingsButton = screen.getByRole('button', {
                name: /open playground settings/i,
            })
            expect(settingsButton).toBeInTheDocument()
        })
    })

    describe('close functionality', () => {
        it('should call setIsCollapsibleColumnOpen(false) when close button is clicked', async () => {
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await user.click(closeButton)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should call onClose callback when provided and close button is clicked', async () => {
            const user = userEvent.setup()
            const mockOnClose = jest.fn()
            render(<PlaygroundPanel onClose={mockOnClose} />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await user.click(closeButton)

            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('should call both setIsCollapsibleColumnOpen and onClose when both are available', async () => {
            const user = userEvent.setup()
            const mockOnClose = jest.fn()
            render(<PlaygroundPanel onClose={mockOnClose} />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await user.click(closeButton)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('should not throw error when onClose is not provided', async () => {
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await expect(user.click(closeButton)).resolves.not.toThrow()
            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })
    })

    describe('reset playground functionality', () => {
        it('should pass resetPlayground=true to AiAgentPlayground when reset button is clicked', async () => {
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await user.click(resetButton)

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
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await user.click(resetButton)

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

    describe('edge cases', () => {
        it('should handle multiple reset clicks', async () => {
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await user.click(resetButton)
            await user.click(resetButton)
            await user.click(resetButton)

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
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            const resetButton = screen.getByRole('button', {
                name: /reset playground/i,
            })

            await user.hover(resetButton)

            await waitFor(() => {
                expect(screen.getByText('Reset test')).toBeInTheDocument()
            })
        })

        it('should show tooltip when hovering over close button', async () => {
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            const closeButton = screen.getByRole('button', {
                name: /close playground panel/i,
            })

            await user.hover(closeButton)

            await waitFor(() => {
                expect(screen.getByText('Close')).toBeInTheDocument()
            })
        })
    })

    describe('Settings toggle functionality', () => {
        it('should toggle inplaceSettingsOpen prop when settings button clicked', async () => {
            const user = userEvent.setup()
            render(<PlaygroundPanel />)

            expect(MockAiAgentPlayground).toHaveBeenCalledWith(
                expect.objectContaining({ inplaceSettingsOpen: false }),
                {},
            )

            await user.click(
                screen.getByRole('button', {
                    name: /open playground settings/i,
                }),
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
