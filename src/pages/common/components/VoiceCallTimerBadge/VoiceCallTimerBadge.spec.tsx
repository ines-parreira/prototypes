import {act, render} from '@testing-library/react'
import React from 'react'

import useInterval from 'hooks/useInterval'
import {getFormattedDurationOngoingCall} from 'models/voiceCall/utils'
import {assumeMock} from 'utils/testing'

import VoiceCallTimerBadge from './VoiceCallTimerBadge'

jest.mock('models/voiceCall/utils')
jest.mock('hooks/useInterval')

const getFormattedDurationOngoingCallMock = assumeMock(
    getFormattedDurationOngoingCall
)
const useIntervalMock = assumeMock(useInterval)

const renderComponent = (props: any) => {
    return render(<VoiceCallTimerBadge {...props} />)
}

describe('VoiceCallTimerBadge', () => {
    beforeEach(() => {
        getFormattedDurationOngoingCallMock.mockImplementation((x: string) => x)
    })

    it('should display the formatted duration of the ongoing call', () => {
        getFormattedDurationOngoingCallMock.mockImplementation(
            (datetime: string) => datetime + '-formatted'
        )
        const {getByText} = renderComponent({datetime: 'datetime'})
        expect(getByText('datetime-formatted')).toBeInTheDocument()
    })

    it('should update the displayed duration every second', () => {
        const {getByText} = renderComponent({datetime: 'datetime'})
        getFormattedDurationOngoingCallMock.mockReturnValueOnce('formatted1')

        act(() => {
            useIntervalMock.mock.calls[0][0]()
        })
        expect(getByText('formatted1')).toBeInTheDocument()
    })

    it('should update the displayed duration when the datetime prop changes', () => {
        const {getByText, rerender} = renderComponent({datetime: 'datetime'})

        rerender(<VoiceCallTimerBadge datetime="datetime2" />)
        expect(getByText('datetime2')).toBeInTheDocument()
    })
})
