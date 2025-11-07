import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useFlag } from 'core/flags'

import { AiAgentPlaygroundPage } from '../AiAgentPlaygroundPage'

const mockSetIsCollapsibleColumnOpen = jest.fn()

jest.mock('core/flags')

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: () => ({
        setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
        isCollapsibleColumnOpen: false,
    }),
}))

jest.mock('../hooks/useShopNameResolution', () => ({
    useShopNameResolution: () => ({
        resolvedShopName: 'test-shop',
    }),
}))

jest.mock('../AiAgentPlayground', () => ({
    AiAgentPlayground: ({
        arePlaygroundActionsAllowed,
        withResetButton,
        withSettingsOnSidePanel,
        resetPlayground,
        resetPlaygroundCallback,
    }: any) => (
        <div data-testid="ai-agent-playground">
            <span data-testid="actions-allowed">
                {String(arePlaygroundActionsAllowed)}
            </span>
            <span data-testid="should-display-reset">
                {String(withResetButton)}
            </span>
            <span data-testid="should-display-settings-on-side">
                {String(withSettingsOnSidePanel)}
            </span>
            <span data-testid="reset-playground">
                {String(resetPlayground)}
            </span>
            {resetPlayground && (
                <button onClick={resetPlaygroundCallback}>
                    Reset Callback
                </button>
            )}
        </div>
    ),
}))

jest.mock(
    '../components/PlaygroundActionsToggle/PlaygroundActionsToggle',
    () => ({
        __esModule: true,
        default: ({ value, onChange }: any) => (
            <div data-testid="playground-actions-toggle">
                <button onClick={onChange}>
                    Toggle Actions: {value ? 'Enabled' : 'Disabled'}
                </button>
            </div>
        ),
    }),
)

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: ({ children, titleChildren }: any) => (
        <div data-testid="ai-agent-layout">
            <div data-testid="title-children">{titleChildren}</div>
            <div data-testid="layout-children">{children}</div>
        </div>
    ),
}))

jest.mock('@gorgias/axiom', () => ({
    Button: ({ children, onClick, leadingSlot, variant, ...props }: any) => (
        <button onClick={onClick} data-variant={variant} {...props}>
            {leadingSlot && <span data-icon={leadingSlot} />}
            {children}
        </button>
    ),
}))

describe('AiAgentPlaygroundPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useFlag as jest.Mock).mockReturnValue(false)
    })

    describe('Feature flag disabled (legacy mode)', () => {
        beforeEach(() => {
            ;(useFlag as jest.Mock).mockReturnValue(false)
        })

        it('should render playground actions toggle when feature flag is disabled', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.getByTestId('playground-actions-toggle'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Toggle Actions: Disabled/),
            ).toBeInTheDocument()
        })

        it('should not render reset and configure buttons when feature flag is disabled', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.queryByRole('button', { name: /reset/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /open settings/i }),
            ).not.toBeInTheDocument()
        })

        it('should pass withResetButton as true to AiAgentPlayground', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.getByTestId('should-display-reset'),
            ).toHaveTextContent('true')
        })

        it('should toggle actions when toggle button is clicked', async () => {
            render(<AiAgentPlaygroundPage />)

            const toggleButton = screen.getByText(/Toggle Actions: Disabled/)

            await act(() => userEvent.click(toggleButton))

            await waitFor(() => {
                expect(
                    screen.getByText(/Toggle Actions: Enabled/),
                ).toBeInTheDocument()
            })

            await waitFor(() => {
                expect(screen.getByTestId('actions-allowed')).toHaveTextContent(
                    'true',
                )
            })
        })
    })

    describe('Feature flag enabled (new side panel mode)', () => {
        beforeEach(() => {
            ;(useFlag as jest.Mock).mockImplementation((flag: string) => {
                if (flag === FeatureFlagKey.AiJourneyPlayground) {
                    return true
                }
                return false
            })
        })

        it('should render reset button when feature flag is enabled', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.getByRole('button', { name: /reset/i }),
            ).toBeInTheDocument()
        })

        it('should render configure button when feature flag is enabled and panel is closed', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.getByRole('button', { name: /open settings/i }),
            ).toBeInTheDocument()
        })

        it('should not render playground actions toggle when feature flag is enabled', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.queryByTestId('playground-actions-toggle'),
            ).not.toBeInTheDocument()
        })

        it('should pass withResetButton as false to AiAgentPlayground', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.getByTestId('should-display-reset'),
            ).toHaveTextContent('false')
        })

        it('should pass withSettingsOnSidePanel as true to AiAgentPlayground', () => {
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.getByTestId('should-display-settings-on-side'),
            ).toHaveTextContent('true')
        })

        it('should set resetPlayground to true when reset button is clicked', async () => {
            render(<AiAgentPlaygroundPage />)

            const resetButton = screen.getByRole('button', { name: /reset/i })

            await act(() => userEvent.click(resetButton))

            await waitFor(() => {
                expect(
                    screen.getByTestId('reset-playground'),
                ).toHaveTextContent('true')
            })
        })

        it('should reset shouldPlaygroundReset after resetPlaygroundCallback is called', async () => {
            render(<AiAgentPlaygroundPage />)

            const resetButton = screen.getByRole('button', { name: /reset/i })

            await act(() => userEvent.click(resetButton))

            await waitFor(() => {
                expect(
                    screen.getByTestId('reset-playground'),
                ).toHaveTextContent('true')
            })

            const callbackButton = screen.getByText('Reset Callback')
            await act(() => userEvent.click(callbackButton))

            await waitFor(() => {
                expect(
                    screen.getByTestId('reset-playground'),
                ).toHaveTextContent('false')
            })
        })

        it('should call setIsCollapsibleColumnOpen when configure button is clicked', async () => {
            render(<AiAgentPlaygroundPage />)

            const configureButton = screen.getByRole('button', {
                name: /open settings/i,
            })

            await act(() => userEvent.click(configureButton))

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        })
    })

    describe('Props propagation', () => {
        it('should pass arePlaygroundActionsAllowed as false by default', () => {
            ;(useFlag as jest.Mock).mockReturnValue(false)
            render(<AiAgentPlaygroundPage />)

            expect(screen.getByTestId('actions-allowed')).toHaveTextContent(
                'false',
            )
        })

        it('should always pass withSettingsOnSidePanel as true', () => {
            ;(useFlag as jest.Mock).mockReturnValue(false)
            render(<AiAgentPlaygroundPage />)

            expect(
                screen.getByTestId('should-display-settings-on-side'),
            ).toHaveTextContent('true')
        })

        it('should pass resetPlayground as false by default', () => {
            ;(useFlag as jest.Mock).mockReturnValue(false)
            render(<AiAgentPlaygroundPage />)

            expect(screen.getByTestId('reset-playground')).toHaveTextContent(
                'false',
            )
        })
    })
})
