import React from 'react'
import {render, screen} from '@testing-library/react'
import {setAgentFeedbackMessageStatus} from 'state/agents/actions'
import {FeedbackStatus, ResourceSection} from '../types'
import FeedbackStatusBadge from '../FeedbackStatusBadge'

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

describe('FeedbackStatusBadge', () => {
    const resourceSection: ResourceSection = ResourceSection.ACTIONS // Example resource section

    it('renders null when status is null', () => {
        render(
            <FeedbackStatusBadge
                status={null}
                resourceSection={resourceSection}
            />
        )
        expect(screen.queryByRole('status')).toBeNull()
    })

    it('renders correctly when status is "saving"', () => {
        render(
            <FeedbackStatusBadge
                status={FeedbackStatus.SAVING}
                resourceSection={resourceSection}
            />
        )
        expect(screen.getByText('saving')).toBeInTheDocument()

        expect(
            screen
                .queryByTestId('badge-test-id')
                ?.querySelector('.icon-circle-o-notch')
        ).toBeInTheDocument()
    })

    it('renders correctly when status is "error"', () => {
        render(
            <FeedbackStatusBadge
                status={FeedbackStatus.ERROR}
                resourceSection={resourceSection}
            />
        )
        expect(screen.getByText('error')).toBeInTheDocument()
        expect(
            screen
                .queryByTestId('badge-test-id')
                ?.querySelector('.material-icons')
        ).toHaveTextContent('warning')
    })

    it('renders correctly when status is "saved"', () => {
        render(
            <FeedbackStatusBadge
                status={FeedbackStatus.SAVED}
                resourceSection={resourceSection}
            />
        )
        expect(screen.getByText('saved')).toBeInTheDocument()
        expect(
            screen
                .queryByTestId('badge-test-id')
                ?.querySelector('.material-icons')
        ).toHaveTextContent('check_circle')
    })

    it('dispatches setAgentFeedbackMessageStatus action after 5 seconds', () => {
        jest.useFakeTimers()

        render(
            <FeedbackStatusBadge
                status={FeedbackStatus.SAVED}
                resourceSection={resourceSection}
            />
        )

        expect(mockDispatch).not.toHaveBeenCalled()

        // Advance timers by 5 seconds
        jest.advanceTimersByTime(5000)

        expect(mockDispatch).toHaveBeenCalledWith(
            setAgentFeedbackMessageStatus(null, resourceSection)
        )

        jest.useRealTimers()
    })

    it('clears timeout on unmount', () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

        const {unmount} = render(
            <FeedbackStatusBadge
                status={FeedbackStatus.SAVED}
                resourceSection={resourceSection}
            />
        )

        unmount()

        // Ensure that the timeout has been cleared
        expect(clearTimeoutSpy).toHaveBeenCalled()

        clearTimeoutSpy.mockRestore()
    })
})
