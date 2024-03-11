import React, {ComponentProps} from 'react'
import {render, RenderResult} from '@testing-library/react'
import {VoiceCall, VoiceCallRecordingType} from 'models/voiceCall/types'
import {User} from 'config/types/user'

import TicketVoiceCallContainer from '../TicketVoiceCallContainer'

const header = <div>Header</div>
const user = {name: 'John Doe'} as User
const callStatus = 'Call Status'
const dateTime = '2022-01-01T00:00:00.000Z'
const voiceCall = {
    duration: 60,
    has_call_recording: false,
} as VoiceCall
const icon = 'phone'

jest.mock(
    '../CollapsibleDetails',
    () =>
        ({children, title}: {children: any; title: any}) =>
            (
                <div>
                    <div>title: {title}</div>
                    <div>{children}</div>
                </div>
            )
)

jest.mock(
    '../TicketVoiceCallAudio',
    () =>
        ({type}: {type: VoiceCallRecordingType}) =>
            <div>Audio {type}</div>
)

jest.mock('../TicketVoiceCallDuration', () => () => <div>Duration</div>)

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({dateTime}: {dateTime: string}) =>
            <div>DatetimeLabel {dateTime}</div>
)

jest.mock('pages/common/components/Avatar/Avatar', () => () => (
    <div>Avatar</div>
))

const renderComponent = (
    props: Partial<ComponentProps<typeof TicketVoiceCallContainer>>
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
        />
    )
}

describe('TicketVoiceCallContainer', () => {
    it('renders the component with all props', () => {
        const {getByText} = renderComponent({
            voiceCall: {
                ...voiceCall,
                has_call_recording: true,
                has_voicemail: true,
            },
        })

        expect(getByText('Header')).toBeInTheDocument()
        expect(getByText('Avatar')).toBeInTheDocument()
        expect(getByText('Call Status')).toBeInTheDocument()
        expect(
            getByText('DatetimeLabel 2022-01-01T00:00:00.000Z')
        ).toBeInTheDocument()
        expect(getByText('Duration')).toBeInTheDocument()
        expect(getByText('Call Recording')).toBeInTheDocument()
        expect(getByText('Audio call-recording')).toBeInTheDocument()
        expect(getByText('Voicemail left')).toBeInTheDocument()
        expect(getByText('Audio voicemail')).toBeInTheDocument()
    })

    it('renders the component without call recording or voicemail', () => {
        const {queryByText} = renderComponent({
            voiceCall: {...voiceCall, has_call_recording: false},
        })

        expect(queryByText('Call Recording')).not.toBeInTheDocument()
        expect(queryByText('Voicemail left')).not.toBeInTheDocument()
    })
})
