import { userEvent } from '@repo/testing'
import { act, render, waitFor } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { reportError } from 'utils/errors'

import withTypingActivity, { TypingActivityProps } from '../withTypingActivity'

jest.mock('utils/errors')
jest.mock('core/flags')
jest.mock('@gorgias/realtime', () => ({
    ...jest.requireActual('@gorgias/realtime'),
    useAgentActivity: jest.fn().mockImplementation(() => ({
        startTyping: mockStartTyping,
        stopTyping: mockStopTyping,
    })),
}))
const mockStartTyping = jest.fn()
const mockStopTyping = jest.fn()
const mockUseFlag = useFlag as jest.Mock

const WrappedComponent = ({ handleTypingActivity }: TypingActivityProps) => {
    return <div onClick={handleTypingActivity}>wrapped</div>
}

class PubNubError extends Error {
    status: Record<string, unknown>
    name: string

    constructor(status: Record<string, unknown>) {
        super()
        this.status = status
        this.name = 'PubNubError'
    }
}

const mockPubNubError = new PubNubError({
    reason: 'it failed',
    statusCode: 500,
    operation: 'foo',
    category: 'bar',
})

describe('withTypingActivity', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)
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
        mockStartTyping.mockRejectedValueOnce(mockPubNubError)

        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(
                new Error('PubNub Status error'),
                {
                    tags: {
                        statusCode: 500,
                        operation: 'foo',
                        category: 'bar',
                    },
                    extra: { status: mockPubNubError.status },
                },
            )
        })
    })

    it('should handle stopTyping rejections and forward status to sentry', async () => {
        jest.useFakeTimers()
        mockStopTyping.mockRejectedValueOnce(mockPubNubError)

        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        jest.advanceTimersByTime(3000)
        jest.useRealTimers()

        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(
                new Error('PubNub Status error'),
                {
                    tags: {
                        statusCode: 500,
                        operation: 'foo',
                        category: 'bar',
                    },
                    extra: { status: mockPubNubError.status },
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
            expect(reportError).not.toHaveBeenCalled()
        })
    })

    it('should handle errors without statusCode, operation, or category', async () => {
        const error = new PubNubError({ reason: 'it failed' })

        mockStartTyping.mockRejectedValueOnce(error)

        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        act(() => {
            userEvent.click(getByText('wrapped'))
        })

        await waitFor(() => {
            expect(reportError).toHaveBeenCalledWith(
                new Error('PubNub Status error'),
                {
                    tags: {
                        statusCode: 'unknown',
                        operation: 'unknown',
                        category: 'unknown',
                    },
                    extra: { status: { reason: 'it failed' } },
                },
            )
        })
    })
})
