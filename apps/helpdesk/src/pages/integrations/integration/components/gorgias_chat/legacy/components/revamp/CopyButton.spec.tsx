import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CopyButton } from './CopyButton'

jest.mock('copy-to-clipboard', () => jest.fn())

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

            expect(
                screen.getByRole('img', { name: 'copy' }),
            ).toBeInTheDocument()
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

            expect(
                screen.getByRole('img', { name: 'check' }),
            ).toBeInTheDocument()
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

            expect(
                screen.getByRole('img', { name: 'check' }),
            ).toBeInTheDocument()

            act(() => {
                jest.advanceTimersByTime(5000)
            })

            expect(
                screen.getByRole('img', { name: 'copy' }),
            ).toBeInTheDocument()
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
