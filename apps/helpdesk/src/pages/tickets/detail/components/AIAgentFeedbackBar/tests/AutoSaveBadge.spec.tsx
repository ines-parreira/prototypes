import { render, userEvent } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import AutoSaveBadge from '../AutoSaveBadge'

jest.useFakeTimers()

// Mock useGetDateAndTimeFormat hook
jest.mock('hooks/useGetDateAndTimeFormat')
const useGetDateAndTimeFormatMock = useGetDateAndTimeFormat as jest.Mock

describe('AutoSaveBadge', () => {
    beforeEach(() => {
        // Set default mock implementation for the hook
        useGetDateAndTimeFormatMock.mockReturnValue('MMMM DD, YYYY')
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.clearAllMocks()
    })

    it('renders nothing when state is INITIAL', () => {
        const { container } = render(
            <AutoSaveBadge state={AutoSaveState.INITIAL} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders saving text when state is SAVING', () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVING} />)

        expect(screen.getByText('Saving')).toBeInTheDocument()
    })

    it('renders saved check icon and text, hides text after timeout', async () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.getByText('check')).toBeInTheDocument()
        expect(screen.getByText('Saved')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Saved')).not.toBeInTheDocument()
        })
    })

    it('should show tooltip after STALE_TIMEOUT if updatedAt is provided', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        const updatedAt = new Date()
        render(
            <AutoSaveBadge state={AutoSaveState.SAVED} updatedAt={updatedAt} />,
        )

        expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await user.hover(screen.getByText('check'))

        await waitFor(() => {
            expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
        })
    })

    it('should not show tooltip if updatedAt is not provided', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await user.hover(screen.getByText('check'))

        await waitFor(() => {
            expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument()
        })
    })

    it('should handle string updatedAt prop correctly', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        const dateString = new Date('2023-01-01T12:00:00Z')
        render(
            <AutoSaveBadge
                state={AutoSaveState.SAVED}
                updatedAt={dateString}
            />,
        )

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await user.hover(screen.getByText('check'))

        await waitFor(() => {
            expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
        })
    })

    it('should handle initial state with updatedAt correctly', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        const updatedAt = new Date()
        render(
            <AutoSaveBadge
                state={AutoSaveState.INITIAL}
                updatedAt={updatedAt}
            />,
        )

        // Should not be empty when state is INITIAL but updatedAt is provided
        expect(screen.getByText('check')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await user.hover(screen.getByText('check'))

        await waitFor(() => {
            expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
        })
    })

    it('should render custom icon when savedIcon prop is provided', () => {
        const customIcon = <span>Custom Icon</span>
        render(
            <AutoSaveBadge
                state={AutoSaveState.SAVED}
                savedIcon={customIcon}
            />,
        )

        expect(screen.getByText('Custom Icon')).toBeInTheDocument()
        expect(screen.queryByText('check')).not.toBeInTheDocument()
    })

    it('should render default check icon when savedIcon prop is not provided', () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.getByText('check')).toBeInTheDocument()
    })

    describe('minimal variant', () => {
        it('should render badge during saving state', () => {
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVING}
                    variant="minimal"
                />,
            )

            expect(screen.getByText('Saving')).toBeInTheDocument()
        })

        it('should render badge with "Saved" text immediately after save', async () => {
            const updatedAt = new Date()
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    variant="minimal"
                />,
            )

            expect(screen.getByText('Saved')).toBeInTheDocument()
        })

        it('should transition to icon-only (no text) after stale timeout', async () => {
            const updatedAt = new Date()
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    variant="minimal"
                />,
            )

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            await waitFor(() => {
                expect(screen.queryByText('Saved')).not.toBeInTheDocument()
                expect(screen.getByText('check')).toBeInTheDocument()
            })
        })

        it('should render custom icon in minimal mode', async () => {
            const updatedAt = new Date()
            const customIcon = <span>Custom Icon</span>
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    savedIcon={customIcon}
                    variant="minimal"
                />,
            )

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            await waitFor(() => {
                expect(screen.getByText('Custom Icon')).toBeInTheDocument()
            })
        })

        it('should still show tooltip after transition to icon-only', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const updatedAt = new Date()
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    variant="minimal"
                />,
            )

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            await user.hover(screen.getByText('check'))

            await waitFor(() => {
                expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
            })
        })
    })
})
