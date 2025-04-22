import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAgentActivity } from '@gorgias/realtime'

import withTypingActivity, { TypingActivityProps } from '../withTypingActivity'

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockStartTyping = jest.fn()
const mockStopTyping = jest.fn()

const WrappedComponent = ({ handleTypingActivity }: TypingActivityProps) => {
    return <div onClick={handleTypingActivity}>wrapped</div>
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
})
