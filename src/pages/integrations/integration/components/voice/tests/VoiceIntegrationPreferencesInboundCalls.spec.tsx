import {render, RenderResult, screen} from '@testing-library/react'
import React from 'react'

import {FormField} from 'core/forms'

import {assumeMock} from 'utils/testing'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

import {
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
    WAIT_TIME_VALIDATION_ERROR,
} from '../constants'
import VoiceIntegrationPreferencesInboundCalls from '../VoiceIntegrationPreferencesInboundCalls'

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

describe('<VoiceIntegrationPreferencesInboundCalls />', () => {
    const renderComponent = (props: any = {}): RenderResult => {
        return render(<VoiceIntegrationPreferencesInboundCalls {...props} />)
    }

    beforeEach(() => {
        FormFieldMock.mockImplementation(({label}: any) => <div>{label}</div>)
    })

    it('should display team select, ringing behaviour, recording section and ring/wait time when it is not IVR', () => {
        renderComponent()

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
        renderComponent({isIvr: true})

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

    describe('validation', () => {
        const getValidationProp = (fieldName: string) => {
            const recordingNotificationFormFieldCall =
                FormFieldMock.mock.calls.find(
                    (call) => call[0].name === fieldName
                )

            return recordingNotificationFormFieldCall?.[0]?.validation
        }

        it('should set correct validation for ring time', () => {
            renderComponent()

            const validationProp = getValidationProp(
                'meta.preferences.ring_time'
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
                'meta.preferences.wait_time.value'
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
