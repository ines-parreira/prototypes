import { act, render, waitFor } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

import withTypingActivity, { TypingActivityProps } from '../withTypingActivity'

jest.mock('@gorgias/realtime', () => ({
    ...jest.requireActual('@gorgias/realtime'),
    useAgentActivity: jest.fn().mockImplementation(() => ({
        startTyping: mockStartTyping,
        stopTyping: mockStopTyping,
    })),
}))
const mockStartTyping = jest.fn()
const mockStopTyping = jest.fn()

const WrappedComponent = ({ handleTypingActivity }: TypingActivityProps) => {
    return <div onClick={handleTypingActivity}>wrapped</div>
}

describe('withTypingActivity', () => {
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
})
