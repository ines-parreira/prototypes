import {useAgentActivity} from '@gorgias/realtime'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {ContentState} from 'draft-js'
import {fromJS} from 'immutable'
import React from 'react'

import {TicketMessageSourceType} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'

import {getCurrentUserId} from 'state/currentUser/selectors'
import {
    getNewMessageSignature,
    getNewMessageType,
} from 'state/newMessage/selectors'
import {getTicket} from 'state/ticket/selectors'

import withTypingActivity, {TypingActivityProps} from '../withTypingActivity'

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock
const mockGetTicketActivity = jest.fn()
const mockStartTyping = jest.fn()
const mockStopTyping = jest.fn()

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('state/currentUser/selectors')
const mockGetCurrentUserId = getCurrentUserId as unknown as jest.Mock
jest.mock('state/ticket/selectors')
const mockGetTicket = getTicket as unknown as jest.Mock
jest.mock('state/newMessage/selectors')
const mockGetNewMessageType = getNewMessageType as unknown as jest.Mock
const mockGetNewMessageSignature = getNewMessageSignature as jest.Mock

let contentState: ContentState

describe('withTypingActivity', () => {
    beforeEach(() => {
        contentState = ContentState.createFromText('')

        mockGetTicketActivity.mockReturnValue({typing: []})
        mockUseAgentActivity.mockReturnValue({
            startTyping: mockStartTyping,
            stopTyping: mockStopTyping,
            getTicketActivity: mockGetTicketActivity,
        })
        mockUseAppSelector.mockImplementation(
            (callback: (...args: unknown[]) => unknown) => callback()
        )
        mockGetTicket.mockReturnValue({id: 1})
        mockGetCurrentUserId.mockReturnValue(1)
        mockGetNewMessageType.mockReturnValue('email')
        mockGetNewMessageSignature.mockReturnValue(fromJS({}))
    })

    const WrappedComponent = ({handleTypingActivity}: TypingActivityProps) => {
        const handleTyping = () => {
            handleTypingActivity(contentState)
        }

        return <div onClick={handleTyping}>Wrapped Component</div>
    }

    it('should register typing start', () => {
        contentState = ContentState.createFromText('foo')
        const Component = withTypingActivity(WrappedComponent)

        const {getByText} = render(<Component />)
        userEvent.click(getByText('Wrapped Component'))

        expect(mockStartTyping).toHaveBeenCalledTimes(1)
    })

    it('should not register typing start if content is empty', () => {
        contentState = ContentState.createFromText('')
        const Component = withTypingActivity(WrappedComponent)

        const {getByText} = render(<Component />)
        userEvent.click(getByText('Wrapped Component'))

        expect(mockStartTyping).not.toHaveBeenCalled()
    })

    it('should not register typing start if content is only signature', () => {
        contentState = ContentState.createFromText('\n\nsignature')
        mockGetNewMessageSignature.mockReturnValue(fromJS({text: 'signature'}))

        const Component = withTypingActivity(WrappedComponent)

        const {getByText} = render(<Component />)
        userEvent.click(getByText('Wrapped Component'))

        expect(mockStartTyping).not.toHaveBeenCalled()
    })

    it('should not register typing start if content is internal note', () => {
        contentState = ContentState.createFromText('foo')
        mockGetNewMessageType.mockReturnValue(
            TicketMessageSourceType.InternalNote
        )

        const Component = withTypingActivity(WrappedComponent)

        const {getByText} = render(<Component />)
        userEvent.click(getByText('Wrapped Component'))

        expect(mockStartTyping).not.toHaveBeenCalled()
    })

    it('should register typing stop', () => {
        mockGetTicketActivity.mockReturnValue({typing: [{id: 1}]})

        contentState = ContentState.createFromText('')
        const Component = withTypingActivity(WrappedComponent)

        const {getByText} = render(<Component />)
        userEvent.click(getByText('Wrapped Component'))

        expect(mockStopTyping).toHaveBeenCalledTimes(1)
    })
})
