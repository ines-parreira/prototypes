import React from 'react'

import { render, RenderResult, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { FormField, useFormContext } from 'core/forms'
import { assumeMock } from 'utils/testing'

import {
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
    WAIT_TIME_VALIDATION_ERROR,
} from '../constants'
import VoiceIntegrationPreferencesInboundCalls from '../VoiceIntegrationPreferencesInboundCalls'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

const watchMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
    formState: { defaultValues: {} },
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('<VoiceIntegrationPreferencesInboundCalls />', () => {
    const renderComponent = (props: any = {}): RenderResult => {
        return render(<VoiceIntegrationPreferencesInboundCalls {...props} />)
    }

    beforeEach(() => {
        FormFieldMock.mockImplementation(({ label }: any) => <div>{label}</div>)
        watchMock.mockReturnValue(false as boolean)
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
        useFlagMock.mockReturnValue(true)
    })

    it('should display team select, ringing behaviour, recording section and ring/wait time when it is not IVR and FF is off', () => {
        useFlagMock.mockReturnValue(false)
        renderComponent()

        expect(screen.getByText('Set ringing behaviour')).toBeInTheDocument()
        expect(screen.getByText('Ring time per agent')).toBeInTheDocument()
        expect(screen.getByText('Max wait time')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Hold calls in queue until an agent becomes available',
            ),
        ).toBeInTheDocument()
        expect(FormFieldMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.send_calls_to_voicemail',
            }),
            {},
        )
    })

    it('should only display send to voicemail when send_to_voicemail=true', () => {
        watchMock.mockReturnValue(true as boolean)
        renderComponent()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.send_calls_to_voicemail',
            }),
            {},
        )
        expect(screen.queryByText('Route to a team')).toBeNull()
        expect(FormFieldMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.ringing_behaviour',
            }),
            {},
        )
        expect(screen.queryByText('Ring time per agent')).toBeNull()
        expect(screen.queryByText('Max wait time')).toBeNull()
        expect(
            screen.queryByText(
                'Hold calls in queue until an agent becomes available',
            ),
        ).toBeNull()
    })

    it('should display send to voicemail, team select, ringing behavior, recording section and ring/wait time when it is not IVR', () => {
        renderComponent()

        expect(screen.getByText('Route to a team')).toBeInTheDocument()
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.send_calls_to_voicemail',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.preferences.ringing_behaviour',
            }),
            {},
        )
        expect(screen.getByText('Ring time per agent')).toBeInTheDocument()
        expect(screen.getByText('Max wait time')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Hold calls in queue until an agent becomes available',
            ),
        ).toBeInTheDocument()
    })

    it('should not display team select, ringing behavior, recording section and ring/wait time when it is IVR', () => {
        renderComponent({ isIvr: true })

        expect(screen.queryByText('Set ringing behaviour')).toBeNull()
        expect(screen.queryByText('Start recording automatically')).toBeNull()
        expect(screen.queryByText('Ring Time')).toBeNull()
        expect(screen.queryByText('Wait Time')).toBeNull()
        expect(
            screen.queryByText(
                'Hold calls in queue until an agent becomes available',
            ),
        ).toBeNull()
        expect(FormFieldMock).not.toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.send_calls_to_voicemail',
            }),
            {},
        )
    })

    describe('validation', () => {
        const getValidationProp = (fieldName: string) => {
            const recordingNotificationFormFieldCall =
                FormFieldMock.mock.calls.find(
                    (call) => call[0].name === fieldName,
                )

            return recordingNotificationFormFieldCall?.[0]?.validation
        }

        it('should set correct validation for ring time', () => {
            renderComponent()

            const validationProp = getValidationProp(
                'meta.preferences.ring_time',
            )

            expect(validationProp).toEqual({
                required: RING_TIME_VALIDATION_ERROR,
                min: {
                    value: RING_TIME_MIN_VALUE,
                    message: RING_TIME_VALIDATION_ERROR,
                },
                max: {
                    value: RING_TIME_MAX_VALUE,
                    message: RING_TIME_VALIDATION_ERROR,
                },
            })
        })

        it('should set correct validation for wait time', () => {
            renderComponent()

            const validationProp = getValidationProp(
                'meta.preferences.wait_time.value',
            )

            expect(validationProp).toEqual({
                required: WAIT_TIME_VALIDATION_ERROR,
                min: {
                    value: WAIT_TIME_MIN_VALUE,
                    message: WAIT_TIME_VALIDATION_ERROR,
                },
                max: {
                    value: WAIT_TIME_MAX_VALUE,
                    message: WAIT_TIME_VALIDATION_ERROR,
                },
            })
        })
    })
})
