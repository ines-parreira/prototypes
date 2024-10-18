import {
    RenderResult,
    cleanup,
    fireEvent,
    screen,
    waitFor,
} from '@testing-library/react'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import {IntegrationType} from 'models/integration/constants'
import {integrationsState} from 'fixtures/integrations'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {mockStore} from 'utils/testing'
import VoiceIntegrationPreferences from '../VoiceIntegrationPreferences'
import {isValueInRange} from '../utils'

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone
)

jest.mock(
    '../VoiceIntegrationPreferencesInboundCalls',
    () =>
        ({
            onPreferencesChange,
            onPhoneTeamIdChange,
            errors,
        }: {
            onPreferencesChange: (value: any) => void
            onPhoneTeamIdChange: (value: string | number) => void
            errors: Record<string, string>
        }) => (
            <>
                <input
                    data-testid="preferencesInput"
                    onChange={onPreferencesChange}
                />
                <input
                    data-testid="phoneTeamIdInput"
                    onChange={(event) =>
                        onPhoneTeamIdChange(event.target.value)
                    }
                />
                <div data-testid="errors">
                    {Object.keys(errors).map((key) => (
                        <span key={key} data-testid={`errors-${key}`}>
                            {errors[key]}
                        </span>
                    ))}
                </div>
            </>
        )
)

jest.mock('../utils', () => {
    return {
        isValueInRange: jest.fn(),
    }
})

describe('<VoiceIntegrationPreferences />', () => {
    const props = {
        integration: {
            ...phoneIntegration,
            meta: {
                ...(phoneIntegration?.meta ?? {}),
                phone_team_id: 1,
            },
        },
    }
    const propsWithTranscribe = {
        integration: {
            ...phoneIntegration,
            meta: {
                ...(phoneIntegration?.meta ?? {}),
                phone_team_id: 1,
                transcribe: {
                    recordings: false,
                    voicemails: false,
                },
            },
        },
    }

    const renderComponent = (props: any = {}): RenderResult => {
        return renderWithQueryClientProvider(
            <BrowserRouter>
                <Provider store={mockStore({} as any)}>
                    <VoiceIntegrationPreferences {...props} />
                </Provider>
            </BrowserRouter>
        )
    }

    beforeEach(() => {
        mockFlags({RecordingTranscriptions: true})
    })

    afterEach(() => {
        resetLDMocks()
        cleanup()
    })

    it('should render the component', () => {
        renderComponent(props)
        expect(screen.getByText('App title')).toBeInTheDocument()
    })

    it('should render the component with transcription FF on', () => {
        renderComponent(props)

        expect(screen.getByText('App title')).toBeInTheDocument()

        expect(screen.getByText('Call Recording')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Automatically record and store all customer calls'
            )
        ).toBeInTheDocument()

        expect(screen.getByText('Transcription')).toBeInTheDocument()
        expect(
            screen.getByText('Call recording transcription')
        ).toBeInTheDocument()
        expect(screen.getByText('Voicemail transcription')).toBeInTheDocument()
    })

    it.each([true, false])(
        'should display the submit button as disabled when the form is not dirty',
        (useRecordingTranscriptions) => {
            mockFlags({RecordingTranscriptions: useRecordingTranscriptions})

            renderComponent(props)

            expect(
                screen.getByRole('button', {name: 'Save changes'})
            ).toBeAriaDisabled()
        }
    )

    describe.each([true, false])(
        'when the form is dirty',
        (useRecordingTranscriptions) => {
            beforeEach(() => {
                mockFlags({RecordingTranscriptions: useRecordingTranscriptions})
            })

            afterEach(() => {
                resetLDMocks()
            })

            it('should enable submit when integration root fields are changed', async () => {
                renderComponent(props)

                const titleInput = screen.getByLabelText('App title')
                fireEvent.change(titleInput, {target: {value: 'New title'}})

                await waitFor(() => {
                    expect(
                        screen.getByRole('button', {name: 'Save changes'})
                    ).toBeAriaEnabled()
                })
            })

            it('should enable submit when integration meta fields are changed', async () => {
                renderComponent(props)

                const teamIdSelection = screen.getByTestId('phoneTeamIdInput')
                fireEvent.change(teamIdSelection, {target: {value: 2}})

                await waitFor(() => {
                    expect(
                        screen.getByRole('button', {name: 'Save changes'})
                    ).toBeAriaEnabled()
                })
            })

            it('should enable submit when integration preferences fields are changed', async () => {
                renderComponent(props)

                const preferencesInput = screen.getByTestId('preferencesInput')
                fireEvent.change(preferencesInput, {
                    target: {value: 'new value'},
                })

                await waitFor(() => {
                    expect(
                        screen.getByRole('button', {name: 'Save changes'})
                    ).toBeAriaEnabled()
                })
            })
        }
    )

    it.each([
        {
            label: 'Call recording transcription',
            props,
        },
        {
            label: 'Voicemail transcription',
            props,
        },
        {
            label: 'Call recording transcription',
            props: propsWithTranscribe,
        },
        {
            label: 'Voicemail transcription',
            props: propsWithTranscribe,
        },
    ])(
        'should enable submit when transcription fields are changed',
        async ({label, props}) => {
            renderComponent(props)

            const callRecordingToggle = screen.getByLabelText(label)
            fireEvent.click(callRecordingToggle)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {name: 'Save changes'})
                ).toBeAriaEnabled()
            })
        }
    )

    it.each([
        {
            label: 'Call recording transcription',
            props,
        },
        {
            label: 'Voicemail transcription',
            props,
        },
        {
            label: 'Call recording transcription',
            props: propsWithTranscribe,
        },
        {
            label: 'Voicemail transcription',
            props: propsWithTranscribe,
        },
    ])(
        'should disable submit when transcription fields are reset',
        async ({label, props}) => {
            renderComponent(props)

            // click toggle twice to reset it
            const callRecordingToggle = screen.getByLabelText(label)
            fireEvent.click(callRecordingToggle)
            fireEvent.click(callRecordingToggle)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {name: 'Save changes'})
                ).toBeAriaDisabled()
            })
        }
    )

    it('should enable submit when recording fields are changed', async () => {
        renderComponent(props)

        const recordingToggles = screen.getAllByLabelText(
            'Start recording automatically'
        )
        expect(recordingToggles).toHaveLength(2)
        fireEvent.click(recordingToggles[0])
        fireEvent.click(recordingToggles[1])

        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Save changes'})
            ).toBeAriaEnabled()
        })
    })

    it('should allow to save changes button if there is a valid ring time', async () => {
        const ringTime = 40

        ;(isValueInRange as jest.Mock).mockReturnValue(true)

        renderComponent({
            integration: {
                ...phoneIntegration,
                meta: {
                    ...(phoneIntegration?.meta ?? {}),
                    phone_team_id: 1,
                    preferences: {ring_time: ringTime},
                },
            },
        })

        // change the preferences, so that the submit button becomes enabled
        const preferencesInput = screen.getByTestId('preferencesInput')
        fireEvent.change(preferencesInput, {
            target: {value: 'new value'},
        })

        // the save changes button stays enabled since the ring time is valid
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Save changes'})
            ).toBeAriaEnabled()
        })

        expect(isValueInRange).toHaveBeenCalledWith(ringTime, 10, 600)
    })

    it('should disable save changes button if there is an invalid ring time', async () => {
        const ringTime = 5

        ;(isValueInRange as jest.Mock).mockReturnValue(false)

        renderComponent({
            integration: {
                ...phoneIntegration,
                meta: {
                    ...(phoneIntegration?.meta ?? {}),
                    phone_team_id: 1,
                    preferences: {ring_time: ringTime},
                },
            },
        })

        // change the preferences, so that the submit button becomes enabled
        const preferencesInput = screen.getByTestId('preferencesInput')
        fireEvent.change(preferencesInput, {
            target: {value: 'new value'},
        })

        // however, it is still disabled because of the invalid ring time
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Save changes'})
            ).toBeAriaDisabled()
        })

        // and we also show the corresponding error message
        await waitFor(() => {
            expect(screen.getByTestId('errors-ring_time')).toHaveTextContent(
                'Ring time must be between 10 and 600 seconds (10 minutes).'
            )
        })

        expect(isValueInRange).toHaveBeenCalledWith(ringTime, 10, 600)
    })

    it('should allow to save changes button if there is a valid wait time', async () => {
        const waitTime = 20

        ;(isValueInRange as jest.Mock).mockReturnValue(true)

        renderComponent({
            integration: {
                ...phoneIntegration,
                meta: {
                    ...(phoneIntegration?.meta ?? {}),
                    phone_team_id: 1,
                    preferences: {wait_time: {enabled: true, value: waitTime}},
                },
            },
        })

        // change the preferences, so that the submit button becomes enabled
        const preferencesInput = screen.getByTestId('preferencesInput')
        fireEvent.change(preferencesInput, {
            target: {value: 'new value'},
        })

        // the save changes button stays enabled since the wait time is valid
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Save changes'})
            ).toBeAriaEnabled()
        })

        expect(isValueInRange).toHaveBeenCalledWith(waitTime, 10, 3600)
    })

    it('should disable save changes button if there is an invalid wait time', async () => {
        const waitTime = 5

        ;(isValueInRange as jest.Mock).mockReturnValue(false)

        renderComponent({
            integration: {
                ...phoneIntegration,
                meta: {
                    ...(phoneIntegration?.meta ?? {}),
                    phone_team_id: 1,
                    preferences: {wait_time: {enabled: true, value: waitTime}},
                },
            },
        })

        // change the preferences, so that the submit button becomes enabled
        const preferencesInput = screen.getByTestId('preferencesInput')
        fireEvent.change(preferencesInput, {
            target: {value: 'new value'},
        })

        // however, it is still disabled because of the invalid ring time
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Save changes'})
            ).toBeAriaDisabled()
        })

        // and we also show the corresponding error message
        await waitFor(() => {
            expect(screen.getByTestId('errors-wait_time')).toHaveTextContent(
                'Wait time must be between 10 and 3600 seconds (1 hour).'
            )
        })

        expect(isValueInRange).toHaveBeenCalledWith(waitTime, 10, 3600)
    })
})
