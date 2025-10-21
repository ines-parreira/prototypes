import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { VoiceCallStatus } from '@gorgias/helpdesk-queries'

import { User } from 'config/types/user'
import { useFlag } from 'core/flags'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { VoiceCall, VoiceCallRecordingType } from 'models/voiceCall/types'
import { useVoiceRecordingsContext } from 'pages/common/hooks/useVoiceRecordingsContext'
import { RootState } from 'state/types'

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

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('hooks/integrations/phone/useMonitoringCall')
const useMonitoringCallMock = assumeMock(useMonitoringCall)

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
jest.mock('pages/tickets/detail/components/TicketMessages/Avatar', () => ({
    Avatar: () => <div>New Avatar</div>,
}))
jest.mock('../TicketVoiceCallSummary', () => () => <div>Summary</div>)

jest.mock('pages/common/hooks/useVoiceRecordingsContext')
const mockedUseVoiceRecordingsContext = assumeMock(useVoiceRecordingsContext)

const mockStore = configureMockStore<Partial<RootState>>()

const renderComponent = (
    props: Partial<ComponentProps<typeof TicketVoiceCallContainer>>,
): RenderResult => {
    const store = mockStore({
        currentUser: fromJS({
            id: 123,
            name: 'Test User',
        }),
    })

    return render(
        <Provider store={store}>
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
        </Provider>,
    )
}

describe('TicketVoiceCallContainer', () => {
    const mockToggleRecording = jest.fn()
    const mockMakeMonitoringCall = jest.fn()

    mockedUseVoiceRecordingsContext.mockReturnValue({
        isTranscriptionOpened: () => false,
        isRecordingOpened: () => false,
        toggleTranscriptionOpened: () => {},
        openedRecordings: [],
        closedTranscriptions: [],
        toggleRecordingOpened: mockToggleRecording,
    })

    beforeEach(() => {
        jest.clearAllMocks()
        useFlagMock.mockImplementation((flagKey: FeatureFlagKey) => {
            if (flagKey === FeatureFlagKey.CallListening) {
                return true
            }
            return false
        })
        useMonitoringCallMock.mockReturnValue({
            makeMonitoringCall: mockMakeMonitoringCall,
        })
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

    it('should render the new avatar if the ticket thread revamp is enabled', () => {
        useFlagMock.mockImplementation((flagKey: FeatureFlagKey) => {
            if (flagKey === FeatureFlagKey.TicketThreadRevamp) {
                return true
            }
            if (flagKey === FeatureFlagKey.CallListening) {
                return true
            }
            return false
        })
        renderComponent({
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

        expect(screen.getByText('New Avatar')).toBeInTheDocument()
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

    describe('Monitoring', () => {
        it.each([
            { status: VoiceCallStatus.Answered },
            { status: VoiceCallStatus.Connected },
        ])(
            'should render Listen button when call is in progress with status $status',
            ({ status }) => {
                renderComponent({
                    voiceCall: {
                        ...voiceCall,
                        status,
                    },
                })

                expect(screen.getByText('Listen')).toBeInTheDocument()
            },
        )

        it('should not render Listen button when feature flag is disabled', () => {
            useFlagMock.mockImplementation((flagKey: FeatureFlagKey) => {
                if (flagKey === FeatureFlagKey.CallListening) {
                    return false
                }
                return false
            })

            renderComponent({
                voiceCall: {
                    ...voiceCall,
                    status: VoiceCallStatus.Answered,
                },
            })

            expect(screen.queryByText('Listen')).not.toBeInTheDocument()
        })

        it('should call makeMonitoringCall with correct parameters when Listen button is clicked', () => {
            const testVoiceCall = {
                ...voiceCall,
                status: VoiceCallStatus.Answered,
                external_id: 'test-call-sid-123',
            }

            renderComponent({
                voiceCall: testVoiceCall,
            })

            fireEvent.click(screen.getByText('Listen'))

            expect(mockMakeMonitoringCall).toHaveBeenCalledWith(
                testVoiceCall,
                123,
            )
        })
    })
})
