import React from 'react'
import {
    render,
    fireEvent,
    RenderResult,
    cleanup,
    screen,
} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {PhoneRingingBehaviour} from 'models/integration/types'
import VoiceIntegrationPreferencesInboundCalls from '../VoiceIntegrationPreferencesInboundCalls'

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

jest.mock(
    '../VoiceIntegrationPreferencesTeamSelect',
    () =>
        ({onChange}: {onChange: (e: any) => void}) =>
            (
                <input
                    onChange={(e) => {
                        onChange(e.target.value)
                    }}
                    data-testid="team-select"
                />
            )
)

describe('<VoiceIntegrationPreferencesInboundCalls />', () => {
    const handleChange = jest.fn()

    const props = {
        isIvr: false,
        preferences: {
            ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
        },
        onPreferencesChange: jest.fn(),
        phoneTeamId: 1,
        onPhoneTeamIdChange: jest.fn(),
    }

    const renderComponent = (props: any = {}): RenderResult => {
        return render(
            <VoiceIntegrationPreferencesInboundCalls
                onChange={handleChange}
                {...props}
            />
        )
    }

    beforeEach(() => {
        mockFlags({RecordingTranscriptions: false})
    })

    afterEach(() => {
        resetLDMocks()
        cleanup()
    })

    it('should display team select, ringing behaviour and recording section when it is not IVR', () => {
        renderComponent(props)

        expect(screen.getByTestId('team-select')).toBeInTheDocument()
        expect(screen.getByText('Set ringing behaviour')).toBeInTheDocument()
        expect(
            screen.getByText('Start recording automatically')
        ).toBeInTheDocument()
    })

    it('should not display team select, ringing behaviour and recording section when it is not IVR', () => {
        renderComponent({...props, isIvr: true})

        expect(screen.queryByTestId('team-select')).toBeNull()
        expect(screen.queryByText('Set ringing behaviour')).toBeNull()
        expect(screen.queryByText('Start recording automatically')).toBeNull()
    })

    it('should call onPreferencesChange when ringing behaviour is changed', () => {
        renderComponent(props)

        fireEvent.click(screen.getByText('Broadcast ringing'))

        expect(props.onPreferencesChange).toHaveBeenCalledWith({
            ringing_behaviour: PhoneRingingBehaviour.Broadcast,
        })
    })

    it('should call onPhoneTeamIdChange when team is changed', () => {
        renderComponent(props)

        act(() => {
            fireEvent.change(screen.getByTestId('team-select'), {
                target: {value: 2},
            })
        })

        expect(props.onPhoneTeamIdChange).toHaveBeenCalledWith('2')
    })

    it('should call onPreferencesChange when recording is changed', () => {
        renderComponent(props)

        fireEvent.click(screen.getByText('Start recording automatically'))

        expect(props.onPreferencesChange).toHaveBeenCalledWith({
            record_inbound_calls: true,
        })
    })

    it('should not display recording setting when transcriptions FF is on', () => {
        mockFlags({RecordingTranscriptions: true})

        renderComponent(props)

        expect(screen.queryByText('Start recording automatically')).toBeNull()
    })
})
