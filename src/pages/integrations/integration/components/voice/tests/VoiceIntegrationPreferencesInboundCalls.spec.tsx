import {
    render,
    fireEvent,
    RenderResult,
    cleanup,
    screen,
} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import React from 'react'

import {PhoneRingingBehaviour} from 'models/integration/types'

import VoiceIntegrationPreferencesInboundCalls from '../VoiceIntegrationPreferencesInboundCalls'

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

jest.mock(
    '../VoiceIntegrationPreferencesTeamSelect',
    () =>
        ({onChange}: {onChange: (e: any) => void}) => (
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
            ring_time: 30,
        },
        onPreferencesChange: jest.fn(),
        phoneTeamId: 1,
        onPhoneTeamIdChange: jest.fn(),
        integrationPreferences: {
            ringing_behaviour: PhoneRingingBehaviour.RoundRobin,
            ring_time: 30,
        },
    }

    const renderComponent = (props: any = {}): RenderResult => {
        return render(
            <VoiceIntegrationPreferencesInboundCalls
                onChange={handleChange}
                {...props}
            />
        )
    }

    afterEach(() => {
        resetLDMocks()
        cleanup()
    })

    it('should display team select, ringing behaviour, recording section and ring/wait time when it is not IVR', () => {
        renderComponent(props)

        expect(screen.getByTestId('team-select')).toBeInTheDocument()
        expect(screen.getByText('Set ringing behaviour')).toBeInTheDocument()
        expect(screen.getByText('Ring time per agent')).toBeInTheDocument()
        expect(screen.getByText('Max wait time')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Hold calls in queue until an agent becomes available'
            )
        ).toBeInTheDocument()
    })

    it('should not display team select, ringing behaviour, recording section and ring/wait time when it is not IVR', () => {
        renderComponent({...props, isIvr: true})

        expect(screen.queryByTestId('team-select')).toBeNull()
        expect(screen.queryByText('Set ringing behaviour')).toBeNull()
        expect(screen.queryByText('Start recording automatically')).toBeNull()
        expect(screen.queryByText('Ring Time')).toBeNull()
        expect(screen.queryByText('Wait Time')).toBeNull()
        expect(
            screen.queryByText(
                'Hold calls in queue until an agent becomes available'
            )
        ).toBeNull()
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

    it('should not display recording setting when transcriptions FF is on', () => {
        mockFlags({RecordingTranscriptions: true})

        renderComponent(props)

        expect(screen.queryByText('Start recording automatically')).toBeNull()
    })

    it.each([
        {ringTimeInput: '40', ringTimeValue: 40},
        {ringTimeInput: '', ringTimeValue: Number.NaN},
    ])(
        'should call onPreferencesChange when ring time is changed',
        ({ringTimeInput, ringTimeValue}) => {
            renderComponent(props)

            fireEvent.input(screen.getByLabelText(/Ring time per agent/i), {
                target: {value: ringTimeInput},
            })

            expect(props.onPreferencesChange).toHaveBeenCalledWith({
                ring_time: ringTimeValue,
            })
        }
    )

    it('should show ring time-related errors', () => {
        renderComponent({
            ...props,
            errors: {
                ring_time:
                    'Ring time must be between 10 and 600 seconds (10 minutes).',
            },
        })

        expect(
            screen.getByText(
                'Ring time must be between 10 and 600 seconds (10 minutes).'
            )
        ).toBeInTheDocument()
    })

    it.each([
        {waitTimeInput: '45', waitTimeValue: 45},
        {waitTimeInput: '', waitTimeValue: Number.NaN},
    ])(
        'should call onPreferencesChange when wait time is changed',
        ({waitTimeInput, waitTimeValue}) => {
            renderComponent(props)

            fireEvent.input(screen.getByLabelText(/Max wait time/i), {
                target: {value: waitTimeInput},
            })

            expect(props.onPreferencesChange).toHaveBeenCalledWith({
                wait_time: {enabled: true, value: waitTimeValue},
            })
        }
    )

    it('should call onPreferencesChange when wait time is disabled', () => {
        renderComponent(props)

        fireEvent.click(
            screen.getByText(
                'Hold calls in queue until an agent becomes available'
            )
        )

        expect(props.onPreferencesChange).toHaveBeenCalledWith({
            wait_time: {enabled: false, value: 120},
        })
    })

    it('should show wait time-related errors', () => {
        renderComponent({
            ...props,
            errors: {
                wait_time:
                    'Wait time must be between 10 and 3600 seconds (1 hour).',
            },
        })

        expect(
            screen.getByText(
                'Wait time must be between 10 and 3600 seconds (1 hour).'
            )
        ).toBeInTheDocument()
    })

    it('should correctly set the default values for wait time', () => {
        renderComponent(props)

        expect(screen.getByLabelText(/Max wait time/i)).toBeEnabled()
        expect(
            screen.getByLabelText(
                'Hold calls in queue until an agent becomes available'
            )
        ).toBeChecked()
    })
})
