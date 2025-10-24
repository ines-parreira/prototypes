import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, RenderResult, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { VoiceCallStatus } from '@gorgias/helpdesk-queries'

import { User, UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import { VoiceCall, VoiceCallRecordingType } from 'models/voiceCall/types'
import MonitorCallButton from 'pages/common/components/MonitorCallButton/MonitorCallButton'
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

jest.mock('pages/common/components/MonitorCallButton/MonitorCallButton')
const MonitorCallButtonMock = assumeMock(MonitorCallButton)

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
            role: { name: UserRole.Admin },
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
        MonitorCallButtonMock.mockReturnValue(<div>MonitorCallButton</div>)
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
            { status: VoiceCallStatus.InProgress },
            { status: VoiceCallStatus.Ringing },
        ])(
            'should render MonitorCallButton when call is not in final status ($status)',
            ({ status }) => {
                renderComponent({
                    voiceCall: {
                        ...voiceCall,
                        status,
                        external_id: 'test-call-sid',
                    },
                })

                expect(
                    screen.getByText('MonitorCallButton'),
                ).toBeInTheDocument()
                expect(MonitorCallButtonMock).toHaveBeenCalledWith(
                    {
                        voiceCallToMonitor: expect.objectContaining({
                            status,
                            external_id: 'test-call-sid',
                        }),
                        agentId: 123,
                    },
                    {},
                )
            },
        )

        it.each([
            { status: VoiceCallStatus.Completed },
            { status: VoiceCallStatus.Busy },
            { status: VoiceCallStatus.Canceled },
            { status: VoiceCallStatus.Failed },
            { status: VoiceCallStatus.NoAnswer },
        ])(
            'should not render MonitorCallButton when call is in final status ($status)',
            ({ status }) => {
                renderComponent({
                    voiceCall: {
                        ...voiceCall,
                        status,
                    },
                })

                expect(
                    screen.queryByText('MonitorCallButton'),
                ).not.toBeInTheDocument()
            },
        )

        it('should render MonitorCallButton when user has permission', () => {
            const store = mockStore({
                currentUser: fromJS({
                    id: 123,
                    name: 'Test User',
                    role: { name: UserRole.Admin },
                }),
            })

            render(
                <Provider store={store}>
                    <TicketVoiceCallContainer
                        header={header}
                        user={user}
                        callStatus={callStatus}
                        dateTime={dateTime}
                        voiceCall={{
                            ...voiceCall,
                            status: VoiceCallStatus.Answered,
                            external_id: 'test-call-sid',
                        }}
                        icon={icon}
                        source={{
                            from: 'John Doe',
                            to: 'Jane Doe',
                        }}
                    />
                </Provider>,
            )

            expect(screen.getByText('MonitorCallButton')).toBeInTheDocument()
        })

        it('should not render MonitorCallButton when user does not have permission', () => {
            const store = mockStore({
                currentUser: fromJS({
                    id: 123,
                    name: 'Test User',
                    role: { name: UserRole.LiteAgent },
                }),
            })

            render(
                <Provider store={store}>
                    <TicketVoiceCallContainer
                        header={header}
                        user={user}
                        callStatus={callStatus}
                        dateTime={dateTime}
                        voiceCall={{
                            ...voiceCall,
                            status: VoiceCallStatus.Answered,
                        }}
                        icon={icon}
                        source={{
                            from: 'John Doe',
                            to: 'Jane Doe',
                        }}
                    />
                </Provider>,
            )

            expect(
                screen.queryByText('MonitorCallButton'),
            ).not.toBeInTheDocument()
        })

        it('should render MonitorCallButton for Agent users', () => {
            const store = mockStore({
                currentUser: fromJS({
                    id: 123,
                    name: 'Test User',
                    role: { name: UserRole.Agent },
                }),
            })

            render(
                <Provider store={store}>
                    <TicketVoiceCallContainer
                        header={header}
                        user={user}
                        callStatus={callStatus}
                        dateTime={dateTime}
                        voiceCall={{
                            ...voiceCall,
                            status: VoiceCallStatus.Answered,
                            external_id: 'test-call-sid',
                        }}
                        icon={icon}
                        source={{
                            from: 'John Doe',
                            to: 'Jane Doe',
                        }}
                    />
                </Provider>,
            )

            expect(screen.getByText('MonitorCallButton')).toBeInTheDocument()
        })

        it('should not render MonitorCallButton when feature flag is disabled', () => {
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

            expect(
                screen.queryByText('MonitorCallButton'),
            ).not.toBeInTheDocument()
        })
    })
})
