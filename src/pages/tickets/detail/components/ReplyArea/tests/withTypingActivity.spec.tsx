import React from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAgentActivity } from '@gorgias/realtime'

import withTypingActivity, { TypingActivityProps } from '../withTypingActivity'

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockStartTyping = jest.fn()
const mockStopTyping = jest.fn()

jest.useFakeTimers()

describe('withTypingActivity', () => {
    beforeEach(() => {
        mockUseAgentActivity.mockReturnValue({
            startTyping: mockStartTyping,
            stopTyping: mockStopTyping,
        })
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    const WrappedComponent = ({
        handleTypingActivity,
    }: TypingActivityProps) => {
        return <div onClick={handleTypingActivity}>wrapped</div>
    }

    it('should handle typing start', () => {
        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        userEvent.click(getByText('wrapped'))
        expect(mockStartTyping).toHaveBeenCalled()
    })

    it('should handle typing stop after delay', () => {
        const Component = withTypingActivity(WrappedComponent)
        const { getByText } = render(<Component />)

        userEvent.click(getByText('wrapped'))
        jest.runAllTimers()

        expect(mockStopTyping).toHaveBeenCalled()
    })

    it('should cleanup throttled and debounced functions on unmount', () => {
        const Component = withTypingActivity(WrappedComponent)
        const { getByText, unmount } = render(<Component />)

        userEvent.click(getByText('wrapped'))
        unmount()
        jest.runAllTimers()

        expect(mockStartTyping).toHaveBeenCalledTimes(1)
        expect(mockStopTyping).not.toHaveBeenCalled()
    })
})
