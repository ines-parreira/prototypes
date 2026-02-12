import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { AiAgentPlaygroundPage } from '../AiAgentPlaygroundPage'

const mockSetIsCollapsibleColumnOpen = jest.fn()

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
        withResetButton,
        withSettingsOnSidePanel,
        resetPlayground,
        resetPlaygroundCallback,
    }: any) => (
        <div data-testid="ai-agent-playground">
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
    })

    it('should render reset button', () => {
        render(<AiAgentPlaygroundPage />)

        expect(
            screen.getByRole('button', { name: /reset/i }),
        ).toBeInTheDocument()
    })

    it('should render configure button', () => {
        render(<AiAgentPlaygroundPage />)

        expect(
            screen.getByRole('button', { name: /open settings/i }),
        ).toBeInTheDocument()
    })

    it('should pass withResetButton as false to AiAgentPlayground', () => {
        render(<AiAgentPlaygroundPage />)

        expect(screen.getByTestId('should-display-reset')).toHaveTextContent(
            'false',
        )
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
            expect(screen.getByTestId('reset-playground')).toHaveTextContent(
                'true',
            )
        })
    })

    it('should reset shouldPlaygroundReset after resetPlaygroundCallback is called', async () => {
        render(<AiAgentPlaygroundPage />)

        const resetButton = screen.getByRole('button', { name: /reset/i })

        await act(() => userEvent.click(resetButton))

        await waitFor(() => {
            expect(screen.getByTestId('reset-playground')).toHaveTextContent(
                'true',
            )
        })

        const callbackButton = screen.getByText('Reset Callback')
        await act(() => userEvent.click(callbackButton))

        await waitFor(() => {
            expect(screen.getByTestId('reset-playground')).toHaveTextContent(
                'false',
            )
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

    it('should pass resetPlayground as false by default', () => {
        render(<AiAgentPlaygroundPage />)

        expect(screen.getByTestId('reset-playground')).toHaveTextContent(
            'false',
        )
    })
})
