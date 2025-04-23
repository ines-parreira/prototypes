import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAgentActivity } from '@gorgias/realtime'

import { reportError } from 'utils/errors'

import withTypingActivity, { TypingActivityProps } from '../withTypingActivity'

jest.mock('@gorgias/realtime')
jest.mock('utils/errors')

const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockStartTyping = jest.fn()
const mockStopTyping = jest.fn()

const WrappedComponent = ({ handleTypingActivity }: TypingActivityProps) => {
    return <div onClick={handleTypingActivity}>wrapped</div>
}

class PubNubError extends Error {
    status: Record<string, unknown>

    constructor(status: Record<string, unknown>) {
        super()
        this.status = status
    }
}

describe('withTypingActivity', () => {
    beforeEach(() => {
        mockUseAgentActivity.mockReturnValue({
            startTyping: mockStartTyping,
            stopTyping: mockStopTyping,
        })
    })

    it('should handle typing start', async () => {
        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        await waitFor(() => {
            expect(mockStartTyping).toHaveBeenCalledTimes(1)
        })
    })

    it('should only call start typing once', async () => {
        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
            userEvent.click(getByText('wrapped'))
            userEvent.click(getByText('wrapped'))
        })

        await waitFor(() => {
            expect(mockStartTyping).toHaveBeenCalledTimes(1)
        })
    })

    it('should handle typing stop after delay', async () => {
        jest.useFakeTimers()
        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        jest.advanceTimersByTime(3000)
        jest.useRealTimers()

        await waitFor(() => {
            expect(mockStartTyping).toHaveBeenCalledTimes(1)
            expect(mockStopTyping).toHaveBeenCalledTimes(1)
        })
    })

    it('should cleanup throttled and debounced functions on unmount', async () => {
        const Component = withTypingActivity(WrappedComponent)
        const { getByText, unmount } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        unmount()

        await waitFor(() => {
            expect(mockStartTyping).toHaveBeenCalledTimes(1)
            expect(mockStopTyping).toHaveBeenCalledTimes(1)
        })
    })

    it('should handle startTyping rejections and forward status to sentry', async () => {
        const error = new PubNubError({ reason: 'it failed' })
        mockStartTyping.mockRejectedValueOnce(error)

        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(
                new Error('Realtime typing status error'),
                {
                    extra: { status: { reason: 'it failed' } },
                },
            )
        })
    })

    it('should handle stopTyping rejections and forward status to sentry', async () => {
        jest.useFakeTimers()
        const error = new PubNubError({ reason: 'it failed' })
        mockStopTyping.mockRejectedValueOnce(error)

        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        jest.advanceTimersByTime(3000)
        jest.useRealTimers()

        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(
                new Error('Realtime typing status error'),
                {
                    extra: { status: { reason: 'it failed' } },
                },
            )
        })
    })

    it('should handle errors without status', async () => {
        const error = new Error('it failed')
        mockStartTyping.mockRejectedValueOnce(error)

        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(
                new Error('Realtime typing status error'),
                { extra: {} },
            )
        })
    })
})
