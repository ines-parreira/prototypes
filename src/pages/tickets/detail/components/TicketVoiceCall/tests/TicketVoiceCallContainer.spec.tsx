import React, { ComponentProps } from 'react'

import { fireEvent, render, RenderResult } from '@testing-library/react'

import { User } from 'config/types/user'
import { VoiceCall, VoiceCallRecordingType } from 'models/voiceCall/types'
import { useVoiceRecordingsContext } from 'pages/common/hooks/useVoiceRecordingsContext'
import { assumeMock } from 'utils/testing'

import TicketVoiceCallContainer from '../TicketVoiceCallContainer'

const header = <div>Header</div>
const user = { name: 'John Doe' } as User
const callStatus = 'Call Status'
const dateTime = '2022-01-01T00:00:00.000Z'
const voiceCall = {
    duration: 60,
    has_call_recording: false,
} as VoiceCall
const icon = 'phone'

jest.mock(
    '../TicketVoiceCallAudios',
    () =>
        ({ type }: { type: VoiceCallRecordingType }) => <div>Audio {type}</div>,
)
jest.mock('../VoiceCallTranscription', () => {
    return ({ type }: { audio: any; type: VoiceCallRecordingType }) => (
        <div>Audio {type}</div>
    )
})

jest.mock('../TicketVoiceCallDuration', () => () => <div>Duration</div>)

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({ dateTime }: { dateTime: string }) => (
            <div>DatetimeLabel {dateTime}</div>
        ),
)

jest.mock('pages/common/components/Avatar/Avatar', () => () => (
    <div>Avatar</div>
))
jest.mock('../TicketVoiceCallSummary', () => () => <div>Summary</div>)

jest.mock('pages/common/hooks/useVoiceRecordingsContext')
const mockedUseVoiceRecordingsContext = assumeMock(useVoiceRecordingsContext)

const renderComponent = (
    props: Partial<ComponentProps<typeof TicketVoiceCallContainer>>,
): RenderResult => {
    return render(
        <TicketVoiceCallContainer
            header={header}
            user={user}
            callStatus={callStatus}
            dateTime={dateTime}
            voiceCall={voiceCall}
            icon={icon}
            source={{
                from: 'John Doe',
                to: 'Jane Doe',
            }}
            {...props}
        />,
    )
}

describe('TicketVoiceCallContainer', () => {
    const mockToggleRecording = jest.fn()
    mockedUseVoiceRecordingsContext.mockReturnValue({
        isTranscriptionOpened: () => false,
        isRecordingOpened: () => false,
        toggleTranscriptionOpened: () => {},
        openedRecordings: [],
        closedTranscriptions: [],
        toggleRecordingOpened: mockToggleRecording,
    })

    it('renders the component with all props', () => {
        const { getByText } = renderComponent({
            voiceCall: {
                ...voiceCall,
                has_call_recording: true,
                has_voicemail: true,
                summaries: [
                    {
                        id: 1,
                        summary: 'Summary',
                        created_datetime: '2022-01-01T00:00:00.000Z',
                        recording_id: 1,
                    },
                ],
            },
        })

        expect(getByText('Header')).toBeInTheDocument()
        expect(getByText('Avatar')).toBeInTheDocument()
        expect(getByText('Call Status')).toBeInTheDocument()
        expect(
            getByText('DatetimeLabel 2022-01-01T00:00:00.000Z'),
        ).toBeInTheDocument()
        expect(getByText('Duration')).toBeInTheDocument()
        expect(getByText('Call Recording')).toBeInTheDocument()
        expect(getByText('Voicemail left')).toBeInTheDocument()
        expect(getByText('Summary')).toBeInTheDocument()
    })

    it('renders does not render summary if null', () => {
        const { queryByText } = renderComponent({
            voiceCall,
        })

        expect(queryByText('Summary')).toBeNull()
    })

    it('renders the component without call recording or voicemail', () => {
        const { queryByText } = renderComponent({
            voiceCall: { ...voiceCall, has_call_recording: false },
        })

        expect(queryByText('Call Recording')).not.toBeInTheDocument()
        expect(queryByText('Voicemail left')).not.toBeInTheDocument()
    })

    it('properly collapses audio voicemail', () => {
        const { getByText } = renderComponent({
            voiceCall: {
                ...voiceCall,
                has_voicemail: true,
            },
        })

        fireEvent.click(getByText('Voicemail left'))
        expect(mockToggleRecording).toHaveBeenCalledWith(voiceCall.id)
    })

    it('properly collapses audio call recording', () => {
        const { getByText } = renderComponent({
            voiceCall: {
                ...voiceCall,
                has_call_recording: true,
            },
        })

        fireEvent.click(getByText('Call Recording'))
        expect(mockToggleRecording).toHaveBeenCalledWith(voiceCall.id)
    })
})
