import type React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CopyButton from './CopyButton'

jest.mock('copy-to-clipboard', () => jest.fn())

jest.mock('@gorgias/axiom', () => ({
    Button: ({
        children,
        onClick,
        leadingSlot,
        variant,
        intent,
    }: {
        children: React.ReactNode
        onClick?: () => void
        leadingSlot?: string
        variant?: string
        intent?: string
    }) => (
        <button
            onClick={onClick}
            data-icon={leadingSlot}
            data-variant={variant}
            data-intent={intent}
        >
            {children}
        </button>
    ),
    ButtonVariant: {
        Primary: 'primary',
        Secondary: 'secondary',
    },
    ButtonIntent: {
        Regular: 'regular',
    },
    IconName: {
        Check: 'check',
        Copy: 'copy',
    },
}))

describe('CopyButton', () => {
    const mockValue = '<script>console.log("test")</script>'
    const mockDisplayText = 'Copy code'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('button rendering', () => {
        it('should render button with display text', () => {
            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            expect(screen.getByRole('button')).toHaveTextContent(
                mockDisplayText,
            )
        })

        it('should render with copy icon initially', () => {
            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('data-icon', 'copy')
        })

        it('should render with default variant and intent', () => {
            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('data-variant', 'primary')
            expect(button).toHaveAttribute('data-intent', 'regular')
        })

        it('should render with custom variant and intent', () => {
            render(
                <CopyButton
                    value={mockValue}
                    displayText={mockDisplayText}
                    variant="secondary"
                    intent="regular"
                />,
            )

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('data-variant', 'secondary')
            expect(button).toHaveAttribute('data-intent', 'regular')
        })
    })

    describe('copy functionality', () => {
        it('should copy value to clipboard when clicked', async () => {
            const user = userEvent.setup()
            const copy = require('copy-to-clipboard')

            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')

            await act(async () => {
                await user.click(button)
            })

            expect(copy).toHaveBeenCalledWith(mockValue)
            expect(copy).toHaveBeenCalledTimes(1)
        })

        it('should change text to "Copied" after clicking', async () => {
            const user = userEvent.setup()

            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')

            await act(async () => {
                await user.click(button)
            })

            expect(button).toHaveTextContent('Copied')
        })

        it('should change icon to check after clicking', async () => {
            const user = userEvent.setup()

            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')

            await act(async () => {
                await user.click(button)
            })

            expect(button).toHaveAttribute('data-icon', 'check')
        })
    })

    describe('timer behavior', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        })

        it('should reset text after 5 seconds', async () => {
            const user = userEvent.setup({ delay: null })

            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')

            await act(async () => {
                await user.click(button)
            })

            expect(button).toHaveTextContent('Copied')

            act(() => {
                jest.advanceTimersByTime(5000)
            })

            expect(button).toHaveTextContent(mockDisplayText)
        })

        it('should reset icon after 5 seconds', async () => {
            const user = userEvent.setup({ delay: null })

            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')

            await act(async () => {
                await user.click(button)
            })

            expect(button).toHaveAttribute('data-icon', 'check')

            act(() => {
                jest.advanceTimersByTime(5000)
            })

            expect(button).toHaveAttribute('data-icon', 'copy')
        })

        it('should reset timer when clicked multiple times', async () => {
            const user = userEvent.setup({ delay: null })

            render(
                <CopyButton value={mockValue} displayText={mockDisplayText} />,
            )

            const button = screen.getByRole('button')

            await act(async () => {
                await user.click(button)
            })
            expect(button).toHaveTextContent('Copied')

            act(() => {
                jest.advanceTimersByTime(3000)
            })
            expect(button).toHaveTextContent('Copied')

            await act(async () => {
                await user.click(button)
            })
            expect(button).toHaveTextContent('Copied')

            act(() => {
                jest.advanceTimersByTime(4000)
            })
            expect(button).toHaveTextContent('Copied')

            act(() => {
                jest.advanceTimersByTime(1000)
            })
            expect(button).toHaveTextContent(mockDisplayText)
        })
    })
})
