import type { ComponentProps } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { VoiceCallStatus } from '@gorgias/helpdesk-queries'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import {
    canMonitorCall,
    getCallMonitorability,
} from 'hooks/integrations/phone/monitoring.utils'
import type { VoiceCall, VoiceCallRecordingType } from 'models/voiceCall/types'
import MonitorCallButton from 'pages/common/components/MonitorCallButton/MonitorCallButton'
import { useVoiceRecordingsContext } from 'pages/common/hooks/useVoiceRecordingsContext'
import { renderWithStore } from 'utils/testing'

import TicketVoiceCallContainer from '../TicketVoiceCallContainer'

const header = <div>Header</div>
const user = { name: 'John Doe' } as User
const callStatus = 'Call Status'
const dateTime = '2022-01-01T00:00:00.000Z'
const voiceCall = {
    duration: 60,
    has_call_recording: false,
    last_answered_by_agent_id: 789,
} as VoiceCall
const icon = 'phone'
const inCallAgent = { id: 789, name: 'Guybrush Threepwood' }

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/common/components/MonitorCallButton/MonitorCallButton')
const MonitorCallButtonMock = assumeMock(MonitorCallButton)

jest.mock('hooks/integrations/phone/monitoring.utils')
const canMonitorCallMock = assumeMock(canMonitorCall)
const getCallMonitorabilityMock = assumeMock(getCallMonitorability)

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

jest.mock('hooks/useRecentItems/useRecentItems', () => () => ({
    setRecentItem: jest.fn(),
}))

const renderComponent = (
    props: Partial<ComponentProps<typeof TicketVoiceCallContainer>> = {},
    stateOverrides = {},
) => {
    return renderWithStore(
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
        {
            currentUser: fromJS({
                id: 123,
                name: 'Test User',
                role: { name: UserRole.Admin },
            }),
            agents: fromJS({
                all: [fromJS(inCallAgent)],
            }),
            ...stateOverrides,
        },
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
        canMonitorCallMock.mockReturnValue(true)
        getCallMonitorabilityMock.mockReturnValue({
            isMonitorable: true,
            reason: undefined,
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
                const currentVoiceCall = {
                    ...voiceCall,
                    status,
                    external_id: 'test-call-sid',
                }
                renderComponent({
                    voiceCall: currentVoiceCall,
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
                        isMonitorable: true,
                        reason: undefined,
                    },
                    {},
                )
                expect(getCallMonitorabilityMock).toHaveBeenCalledWith(
                    currentVoiceCall,
                    123,
                    inCallAgent,
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
            renderComponent({
                voiceCall: {
                    ...voiceCall,
                    status: VoiceCallStatus.Answered,
                    external_id: 'test-call-sid',
                },
            })

            expect(screen.getByText('MonitorCallButton')).toBeInTheDocument()
        })

        it('should not render MonitorCallButton when user does not have permission', () => {
            canMonitorCallMock.mockReturnValue(false)

            renderComponent(
                {
                    voiceCall: {
                        ...voiceCall,
                        status: VoiceCallStatus.Answered,
                    },
                },
                {
                    currentUser: fromJS({
                        id: 123,
                        name: 'Test User',
                        role: { name: UserRole.LiteAgent },
                    }),
                },
            )

            expect(
                screen.queryByText('MonitorCallButton'),
            ).not.toBeInTheDocument()
        })

        it('should render MonitorCallButton for Agent users', () => {
            renderComponent(
                {
                    voiceCall: {
                        ...voiceCall,
                        status: VoiceCallStatus.Answered,
                        external_id: 'test-call-sid',
                    },
                },
                {
                    currentUser: fromJS({
                        id: 123,
                        name: 'Test User',
                        role: { name: UserRole.Agent },
                    }),
                },
            )

            expect(screen.getByText('MonitorCallButton')).toBeInTheDocument()
        })
    })
})
