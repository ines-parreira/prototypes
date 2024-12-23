import {HttpResponse, updatePhoneSettings} from '@gorgias/api-client'
import {
    RenderResult,
    cleanup,
    fireEvent,
    screen,
    waitFor,
} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {integrationsState} from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import {IntegrationType} from 'models/integration/constants'
import {isValueInRange} from 'pages/integrations/integration/components/voice/utils'
import VoiceIntegrationPreferences from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences'
import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'
import * as actions from 'state/integrations/actions'
import {UPDATE_INTEGRATION_ERROR} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock('@gorgias/api-client')
const updatePhoneSettingsMock = assumeMock(updatePhoneSettings)

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

jest.mock('state/notifications/actions')
const notifyMock = assumeMock(notify)

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone
)

const fetchIntegratonsMock = jest.spyOn(actions, 'fetchIntegrations')

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

    afterEach(() => {
        cleanup()
    })

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
        dispatchMock.mockReset()
    })

    it('should render the component', () => {
        renderComponent(props)
        expect(screen.getByText('App title')).toBeInTheDocument()
    })

    it('should render the component', () => {
        renderComponent(props)

        expect(screen.getByText('App title')).toBeInTheDocument()

        expect(screen.getByText('Call Recording')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Automatically record and store all customer calls.'
            )
        ).toBeInTheDocument()

        expect(screen.getByText('Transcription')).toBeInTheDocument()
        expect(
            screen.getByText('Call recording transcription')
        ).toBeInTheDocument()
        expect(screen.getByText('Voicemail transcription')).toBeInTheDocument()
    })

    it('should display the submit button as disabled when the form is not dirty', () => {
        renderComponent(props)

        expect(
            screen.getByRole('button', {name: 'Save changes'})
        ).toBeAriaDisabled()
    })

    describe('when the form is dirty', () => {
        it('should enable submit when integration root fields are changed', async () => {
            renderComponent(props)

            const titleInput = screen.getByLabelText('App title')
            fireEvent.change(titleInput, {target: {value: 'New title'}})

            fireEvent.click(
                screen.getByRole('button', {name: /Delete integration/i})
            )
            screen.debug()

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

        it('should display delete warning message and it should not contain text about "saved filters"', () => {
            const {getByText, queryByText, getByRole} = renderComponent(props)

            const titleInput = screen.getByLabelText('App title')
            fireEvent.change(titleInput, {target: {value: 'New title'}})

            fireEvent.click(getByRole('button', {name: /Delete integration/i}))

            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
            ).toBeInTheDocument()
            expect(
                queryByText(INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT)
            ).not.toBeInTheDocument()
        })

        it('should display delete warning message and it should contain text about "saved filters"', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsSavedFilters]: true,
            })

            const {getByText, getByRole} = renderComponent(props)

            const titleInput = screen.getByLabelText('App title')
            fireEvent.change(titleInput, {target: {value: 'New title'}})

            fireEvent.click(getByRole('button', {name: /Delete integration/i}))

            expect(
                getByText(
                    `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT}`
                )
            ).toBeInTheDocument()
        })
    })

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

    it('should call the endpoint successfully', async () => {
        updatePhoneSettingsMock.mockReturnValue(
            Promise.resolve({} as HttpResponse<void>)
        )

        const {rerender, getByLabelText, getAllByLabelText, getByRole} =
            renderComponent(props)

        const titleInput = getByLabelText('App title')
        fireEvent.change(titleInput, {target: {value: 'New title'}})

        const callToggles = getAllByLabelText('Start recording automatically')
        fireEvent.click(callToggles[0])

        await waitFor(() => {
            expect(
                getByRole('button', {name: 'Save changes'})
            ).toBeAriaEnabled()
        })

        fireEvent.click(getByRole('button', {name: 'Save changes'}))

        await waitFor(() => {
            expect(updatePhoneSettingsMock).toHaveBeenCalledWith(
                phoneIntegration?.id,
                {
                    name: 'New title',
                    emoji: phoneIntegration?.meta?.emoji,
                    preferences: {
                        ...phoneIntegration?.meta?.preferences,
                        record_inbound_calls: true,
                    },
                    phone_team_id: 1,
                },
                undefined
            )
            expect(dispatchMock).toHaveBeenCalled()
            expect(notifyMock).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Integration settings successfully updated.',
            })
            expect(fetchIntegratonsMock).toHaveBeenCalledWith()
        })

        const newProps = {
            ...props,
            integration: {
                ...props.integration,
                name: 'New title',
                meta: {
                    ...props.integration.meta,
                    preferences: {
                        ...props.integration.meta.preferences,
                        record_inbound_calls: true,
                    },
                },
            },
        } as any
        rerender(
            <BrowserRouter>
                <Provider store={mockStore({} as any)}>
                    <VoiceIntegrationPreferences {...newProps} />
                </Provider>
            </BrowserRouter>
        )
    })

    it('should call the endpoint with error', async () => {
        updatePhoneSettingsMock.mockRejectedValue('An error occurred')

        renderComponent(props)

        const titleInput = screen.getByLabelText('App title')
        fireEvent.change(titleInput, {target: {value: 'New title'}})

        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Save changes'})
            ).toBeAriaEnabled()
        })

        fireEvent.click(screen.getByRole('button', {name: 'Save changes'}))

        await waitFor(() => {
            expect(updatePhoneSettingsMock).toHaveBeenCalledWith(
                phoneIntegration?.id,
                {
                    name: 'New title',
                    emoji: phoneIntegration?.meta?.emoji,
                    preferences: phoneIntegration?.meta?.preferences,
                    phone_team_id: 1,
                },
                undefined
            )
            expect(dispatchMock).toHaveBeenCalledWith({
                type: UPDATE_INTEGRATION_ERROR,
                error: 'An error occurred',
                verbose: true,
            })
            expect(notifyMock).not.toHaveBeenCalled()
            expect(fetchIntegratonsMock).not.toHaveBeenCalled()
        })
    })
})
