import { act, render, screen, waitFor } from '@testing-library/react'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import AutoSaveBadge from '../AutoSaveBadge'

jest.useFakeTimers()

jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
        LoadingSpinner: () => <div>Spinner</div>,
        Tooltip: () => <div>Tooltip</div>,
    }
})

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

    it('renders saving spinner and text when state is SAVING', () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVING} />)

        expect(screen.getByText('Saving')).toBeInTheDocument()
        expect(screen.getByText('Spinner')).toBeInTheDocument()
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
        const updatedAt = new Date()
        render(
            <AutoSaveBadge state={AutoSaveState.SAVED} updatedAt={updatedAt} />,
        )

        expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).toBeInTheDocument()
        })
    })

    it('should not show tooltip if updatedAt is not provided', async () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()
        })
    })

    it('should handle string updatedAt prop correctly', async () => {
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

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).toBeInTheDocument()
        })
    })

    it('should handle initial state with updatedAt correctly', async () => {
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

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).toBeInTheDocument()
        })
    })
})
